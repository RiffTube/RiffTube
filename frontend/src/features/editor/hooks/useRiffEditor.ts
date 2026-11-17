import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isEqual, pickBy } from 'lodash';
import { usePlayerController } from '@/features/player/context';
import { riffsQueryKey, riffVersionsQueryKey } from '@/features/riffs/hooks';
import {
  createRiff,
  deleteRiff,
  restoreRiffVersion,
  updateRiff,
} from '@/features/riffs/services/riffsApi';
import {
  DEFAULT_RIFF_SECONDS,
  overlappingRiffIds,
  riffDuration,
  roundTime,
  sortByStart,
  TIME_STEP,
  type Riff,
  type RiffContent,
  type RiffTiming,
} from '@/features/riffs/types';
import {
  DISCARD_PROMPT,
  useUnsavedChangesGuard,
} from './useUnsavedChangesGuard';

/** How long a timing edit waits for further edits before it is saved. */
export const TIMING_SAVE_DELAY_MS = 500;
/** How long a deleted riff can still be brought back. */
export const UNDO_DELETE_MS = 5000;

export type TimingField = 'start' | 'end' | 'both';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/**
 * Everything the editor does to a project's riffs.
 *
 * The query cache holds the riffs. Timing edits are written to it at once and
 * saved shortly after; title, text and styling edits are kept as a draft on top
 * of the selected riff until they are saved or reverted, so a background
 * refresh can never overwrite them.
 */
export function useRiffEditor(projectId: string, fetchedRiffs: Riff[]) {
  const queryClient = useQueryClient();
  const player = usePlayerController();
  const queryKey = useMemo(() => riffsQueryKey(projectId), [projectId]);

  const [selectedId, setSelectedId] = useState<string | null>(
    () => sortByStart(fetchedRiffs)[0]?.id ?? null,
  );
  const [edits, setEdits] = useState<Partial<RiffContent>>({});
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<Riff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focusTextId, setFocusTextId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  // Timing edits that the server has not confirmed yet, by riff id. They are
  // kept apart from the cached list so a refresh or another save's failure
  // cannot overwrite them, and shown on top of it.
  const [timingEdits, setTimingEdits] = useState<
    ReadonlyMap<string, RiffTiming>
  >(new Map());

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const isDirtyRef = useRef(false);
  const timingEditsRef = useRef(new Map<string, RiffTiming>());
  const timingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const timingInFlight = useRef(new Set<string>());
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<Riff | null>(null);

  /* ---------- derived state ---------- */

  const riffs = useMemo(
    () =>
      sortByStart(
        fetchedRiffs
          .filter(riff => !hiddenIds.has(riff.id))
          .map(riff => ({ ...riff, ...timingEdits.get(riff.id) })),
      ),
    [fetchedRiffs, hiddenIds, timingEdits],
  );
  const selected = riffs.find(riff => riff.id === selectedId) ?? null;
  const draft = useMemo(
    () => (selected ? { ...selected, ...edits } : null),
    [selected, edits],
  );
  const changedContent = useMemo(
    () =>
      selected
        ? pickBy(
            edits,
            (value, key) => !isEqual(value, selected[key as keyof RiffContent]),
          )
        : {},
    [selected, edits],
  ) as Partial<RiffContent>;
  const isDirty = Object.keys(changedContent).length > 0;
  isDirtyRef.current = isDirty;
  const overlappingIds = useMemo(() => overlappingRiffIds(riffs), [riffs]);

  /* ---------- cache access ---------- */

  const writeRiffs = useCallback(
    (update: (current: Riff[]) => Riff[]) => {
      // A refresh already in flight would put the old list back.
      void queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<Riff[]>(queryKey, current =>
        update(current ?? []),
      );
    },
    [queryClient, queryKey],
  );

  /* ---------- draft: title, text, styling ---------- */

  const changeDraft = useCallback((changes: Partial<RiffContent>) => {
    setEdits(previous => ({ ...previous, ...changes }));
  }, []);

  const revert = useCallback(() => setEdits({}), []);

  /** True when it is fine to drop the draft: nothing unsaved, or the user agreed. */
  const confirmDiscard = useCallback(
    () => !isDirty || window.confirm(DISCARD_PROMPT),
    [isDirty],
  );

  const save = useCallback(async () => {
    if (!selected || !isDirty || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const saved = await updateRiff(projectId, selected.id, changedContent);
      // Only the content was sent, so only the content is taken from the reply.
      writeRiffs(current =>
        current.map(riff =>
          riff.id === saved.id
            ? { ...saved, start: riff.start, end: riff.end }
            : riff,
        ),
      );
      // A text or styling save added a version to the riff's history.
      void queryClient.invalidateQueries({
        queryKey: riffVersionsQueryKey(saved.id),
      });
      // Keep whatever was typed while the save was on its way.
      if (selectedIdRef.current === saved.id) {
        setEdits(previous =>
          pickBy(
            previous,
            (value, key) => !isEqual(value, saved[key as keyof RiffContent]),
          ),
        );
      }
    } catch (saveError) {
      setError(messageOf(saveError, 'Could not save the riff.'));
    } finally {
      setIsSaving(false);
    }
  }, [
    selected,
    isDirty,
    isSaving,
    projectId,
    changedContent,
    writeRiffs,
    queryClient,
  ]);

  /**
   * Makes an older version of the selected riff current again. Resolves to
   * false when the user chose to keep their unsaved changes instead, and
   * rejects when the API refuses, so the history panel can say so in place.
   */
  const restoreVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      if (!selected || isRestoring || !confirmDiscard()) return false;

      setIsRestoring(true);
      try {
        const restored = await restoreRiffVersion(selected.id, versionId);
        // Only text and styling are versioned; the rest stays as it is here.
        writeRiffs(current =>
          current.map(riff =>
            riff.id === restored.id
              ? {
                  ...riff,
                  text: restored.text,
                  styling: restored.styling,
                  version: restored.version,
                }
              : riff,
          ),
        );
        void queryClient.invalidateQueries({
          queryKey: riffVersionsQueryKey(restored.id),
        });
        // The user agreed to drop their draft before restoring.
        if (selectedIdRef.current === restored.id) setEdits({});
        return true;
      } finally {
        setIsRestoring(false);
      }
    },
    [selected, isRestoring, confirmDiscard, writeRiffs, queryClient],
  );

  /* ---------- timing: start and end ---------- */

  const setTimingEdit = useCallback(
    (riffId: string, span: RiffTiming | null) => {
      if (span) timingEditsRef.current.set(riffId, span);
      else timingEditsRef.current.delete(riffId);
      setTimingEdits(new Map(timingEditsRef.current));
    },
    [],
  );

  /**
   * Sends the latest span for one riff. Saves for the same riff never overlap:
   * an edit made while one is on its way is sent when that one has finished,
   * so an older request can never land after a newer one.
   */
  const saveTiming = useCallback(
    async (riffId: string): Promise<void> => {
      const timer = timingTimers.current.get(riffId);
      if (timer !== undefined) clearTimeout(timer);
      timingTimers.current.delete(riffId);

      const sent = timingEditsRef.current.get(riffId);
      if (!sent || timingInFlight.current.has(riffId)) return;

      const stillLatest = () =>
        isEqual(timingEditsRef.current.get(riffId), sent);

      timingInFlight.current.add(riffId);
      try {
        const saved = await updateRiff(projectId, riffId, sent);
        writeRiffs(current =>
          current.map(riff =>
            riff.id === riffId
              ? { ...riff, start: saved.start, end: saved.end }
              : riff,
          ),
        );
        if (stillLatest()) setTimingEdit(riffId, null);
      } catch (saveError) {
        setError(messageOf(saveError, 'Could not save the new timing.'));
        // Give up on this span only, which puts the saved timing back on
        // screen. A newer edit to this riff, or one to another riff, stays.
        if (stillLatest()) setTimingEdit(riffId, null);
      } finally {
        timingInFlight.current.delete(riffId);
      }

      // Something newer arrived meanwhile and is not already waiting its turn.
      if (
        timingEditsRef.current.has(riffId) &&
        !timingTimers.current.has(riffId)
      )
        await saveTiming(riffId);
    },
    [projectId, writeRiffs, setTimingEdit],
  );

  const scheduleTimingSave = useCallback(
    (riffId: string) => {
      const waiting = timingTimers.current.get(riffId);
      if (waiting !== undefined) clearTimeout(waiting);
      timingTimers.current.set(
        riffId,
        setTimeout(() => void saveTiming(riffId), TIMING_SAVE_DELAY_MS),
      );
    },
    [saveTiming],
  );

  /** Applies a new span at once and saves it after a pause. False if it is not a valid span. */
  const setTiming = useCallback(
    (riffId: string, next: RiffTiming): boolean => {
      const start = roundTime(next.start);
      const end = roundTime(next.end);
      if (start < 0 || roundTime(end - start) < TIME_STEP) {
        setError('A riff has to end after it starts.');
        return false;
      }

      setError(null);
      setTimingEdit(riffId, { start, end });
      scheduleTimingSave(riffId);
      return true;
    },
    [setTimingEdit, scheduleTimingSave],
  );

  const changeTiming = useCallback(
    (changes: Partial<RiffTiming>): boolean =>
      selected
        ? setTiming(selected.id, {
            start: changes.start ?? selected.start,
            end: changes.end ?? selected.end,
          })
        : false,
    [selected, setTiming],
  );

  /** Moves the start, the end, or the whole riff, stopping at the nearest valid position. */
  const nudge = useCallback(
    (field: TimingField, delta: number) => {
      if (!selected) return;
      const { start, end } = selected;

      if (field === 'start') {
        const next = Math.min(Math.max(0, start + delta), end - TIME_STEP);
        setTiming(selected.id, { start: next, end });
      } else if (field === 'end') {
        setTiming(selected.id, {
          start,
          end: Math.max(end + delta, start + TIME_STEP),
        });
      } else {
        const shift = Math.max(delta, -start);
        setTiming(selected.id, { start: start + shift, end: end + shift });
      }
    },
    [selected, setTiming],
  );

  /** Starts the riff at the playhead; past its end, the riff moves there whole. */
  const setInPoint = useCallback(() => {
    if (!selected) return;
    const now = roundTime(player.getTime());
    const end =
      now >= selected.end ? now + riffDuration(selected) : selected.end;
    setTiming(selected.id, { start: now, end });
  }, [player, selected, setTiming]);

  const setOutPoint = useCallback(() => {
    if (!selected) return;
    const now = roundTime(player.getTime());
    if (now <= selected.start) {
      setError('The out point has to come after the in point.');
      return;
    }
    setTiming(selected.id, { start: selected.start, end: now });
  }, [player, selected, setTiming]);

  /* ---------- selecting and adding ---------- */

  const select = useCallback(
    (riffId: string) => {
      const riff = riffs.find(candidate => candidate.id === riffId);
      if (!riff) return;

      if (riffId !== selectedId) {
        if (!confirmDiscard()) return;
        setEdits({});
        setSelectedId(riffId);
      }
      // Land a moment early so the riff is seen coming in.
      player.seekTo(riff.start - 1);
    },
    [riffs, selectedId, confirmDiscard, player],
  );

  /** Adds a riff at the playhead, pauses, and asks for the text box to be focused. */
  const addAtPlayhead = useCallback(async () => {
    if (isAdding || !confirmDiscard()) return;
    // The user agreed to drop these (or there were none). From here on, a
    // dirty draft can only mean something typed while the request is out.
    setEdits({});

    player.pause();
    const start = roundTime(player.getTime());
    setIsAdding(true);
    setError(null);
    try {
      const riff = await createRiff(projectId, {
        start,
        end: roundTime(start + DEFAULT_RIFF_SECONDS),
        text: '',
      });
      writeRiffs(current => [
        ...current.filter(existing => existing.id !== riff.id),
        riff,
      ]);
      // Anything typed while the request was on its way was not part of what
      // the user agreed to discard, so the new riff waits in the list instead.
      if (!isDirtyRef.current) {
        setEdits({});
        setSelectedId(riff.id);
        setFocusTextId(riff.id);
      }
    } catch (addError) {
      setError(messageOf(addError, 'Could not add the riff.'));
    } finally {
      setIsAdding(false);
    }
  }, [isAdding, confirmDiscard, player, projectId, writeRiffs]);

  const clearFocusText = useCallback(() => setFocusTextId(null), []);

  /* ---------- deleting, with a window to undo ---------- */

  const unhide = useCallback((riffId: string) => {
    setHiddenIds(current => {
      const next = new Set(current);
      next.delete(riffId);
      return next;
    });
  }, []);

  const commitDelete = useCallback(
    async (riff: Riff) => {
      // No point saving the timing of a riff that is going away...
      const timer = timingTimers.current.get(riff.id);
      if (timer !== undefined) clearTimeout(timer);
      timingTimers.current.delete(riff.id);

      try {
        await deleteRiff(projectId, riff.id);
        writeRiffs(current =>
          current.filter(existing => existing.id !== riff.id),
        );
        setTimingEdit(riff.id, null);
      } catch (deleteError) {
        setError(messageOf(deleteError, 'Could not delete the riff.'));
        // ...unless it is staying after all.
        if (timingEditsRef.current.has(riff.id)) scheduleTimingSave(riff.id);
        // It is back in the list; make sure it can be reached again.
        setSelectedId(current => current ?? riff.id);
      } finally {
        // Gone from the cache by now, or back in view if the delete failed.
        unhide(riff.id);
      }
    },
    [projectId, writeRiffs, unhide, setTimingEdit, scheduleTimingSave],
  );

  /** Sends a delete that is still waiting for its undo window to close. */
  const flushPendingDelete = useCallback(() => {
    const waiting = pendingDeleteRef.current;
    if (!waiting) return;
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
    pendingDeleteRef.current = null;
    setPendingDelete(null);
    void commitDelete(waiting);
  }, [commitDelete]);

  /** Removes the riff from view now and from the server once the undo window closes. */
  const remove = useCallback(
    (riffId: string) => {
      const index = riffs.findIndex(riff => riff.id === riffId);
      if (index === -1) return;
      const riff = riffs[index];

      // Undo brings back the saved riff, not what was being typed into it.
      if (riffId === selectedId && !confirmDiscard()) return;

      // A timing edit still waiting to be saved is left alone: it is saved as
      // usual, so the riff comes back intact if the delete is undone.
      flushPendingDelete();

      if (riffId === selectedId) {
        const neighbour = riffs[index + 1] ?? riffs[index - 1] ?? null;
        setEdits({});
        setSelectedId(neighbour?.id ?? null);
      }

      setHiddenIds(current => new Set(current).add(riffId));
      pendingDeleteRef.current = riff;
      setPendingDelete(riff);
      deleteTimer.current = setTimeout(flushPendingDelete, UNDO_DELETE_MS);
    },
    [riffs, selectedId, confirmDiscard, flushPendingDelete],
  );

  const undoDelete = useCallback(() => {
    const riff = pendingDeleteRef.current;
    if (!riff) return;
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
    pendingDeleteRef.current = null;
    setPendingDelete(null);
    unhide(riff.id);

    if (!isDirty) {
      setEdits({});
      setSelectedId(riff.id);
    }
  }, [unhide, isDirty]);

  /* ---------- leaving ---------- */

  useUnsavedChangesGuard(isDirty, timingEdits.size > 0);

  // Nothing that was promised may be lost when the editor goes away: send the
  // timing saves and the delete that are still waiting.
  const flushRef = useRef(() => {});
  flushRef.current = () => {
    for (const riffId of [...timingEditsRef.current.keys()])
      void saveTiming(riffId);
    flushPendingDelete();
  };

  useEffect(() => {
    const flush = () => flushRef.current();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  return {
    riffs,
    selectedId,
    selected,
    draft,
    isDirty,
    overlappingIds,
    error,
    dismissError: useCallback(() => setError(null), []),
    isAdding,
    isSaving,
    isRestoring,
    restoreVersion,
    isSavingTiming: timingEdits.size > 0,
    pendingDelete,
    focusTextId,
    clearFocusText,
    select,
    addAtPlayhead,
    changeDraft,
    revert,
    save,
    confirmDiscard,
    changeTiming,
    nudge,
    setInPoint,
    setOutPoint,
    remove,
    undoDelete,
  };
}

export type RiffEditor = ReturnType<typeof useRiffEditor>;
