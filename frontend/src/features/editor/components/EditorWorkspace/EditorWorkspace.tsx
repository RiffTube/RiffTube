import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';
import { usePlayerTime } from '@/features/player/context';
import type { Riff, RiffVersion } from '@/features/riffs/types';
import type { RiffEditor } from '../../hooks/useRiffEditor';
import { formatTime } from '../../utils/time';
import AnnotationForm from './components/AnnotationForm';
import AudioPanel from './components/AudioPanel';
import RevisionPanel from './components/RevisionPanel';
import RiffControls from './components/RiffControls';
import TimingControls from './components/TimingControls';
import VideoCard from './components/VideoCard';

interface Props {
  projectTitle: string;
  /** YouTube id of the project's video */
  videoId: string | null;
  /** The riffs to show, with unsaved edits to the selected one applied */
  riffs: Riff[];
  editor: RiffEditor;
}

/** Its own component so only this readout re-renders as the video plays. */
function Playhead() {
  const time = usePlayerTime();
  return (
    <span className="font-mono text-sm text-white/70 tabular-nums">
      Playhead {formatTime(time)}
    </span>
  );
}

const SHORTCUTS = [
  ['T', 'add a riff'],
  ['I / O', 'set start / end'],
  ['← →', 'nudge (Shift: 1s)'],
  ['⌘S', 'save'],
  ['Esc', 'undo changes'],
];

/**
 * One line of key hints under the video. Whatever doesn't fit is cut off;
 * the "?" button opens the whole list.
 */
function ShortcutHints() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <ul
        id="editor-shortcuts"
        aria-label="Keyboard shortcuts"
        className={`flex min-w-0 flex-1 gap-x-3 gap-y-1 text-xs text-white/50 ${
          isOpen
            ? 'flex-wrap'
            : 'overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)] whitespace-nowrap'
        }`}
      >
        {SHORTCUTS.map(([keys, action]) => (
          <li key={keys} className="shrink-0">
            <kbd className="rounded bg-white/10 px-1 font-mono text-white/70">
              {keys}
            </kbd>{' '}
            {action}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="editor-shortcuts"
        aria-label={isOpen ? 'Hide shortcuts' : 'Show all shortcuts'}
        onClick={() => setIsOpen(open => !open)}
        className="h-5 w-5 shrink-0 cursor-pointer rounded-full border border-white/30 text-xs leading-none text-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
      >
        ?
      </button>
    </div>
  );
}

function EditorWorkspace({ projectTitle, videoId, riffs, editor }: Props) {
  const { draft, focusTextId, clearFocusText } = editor;
  const textRef = useRef<HTMLTextAreaElement>(null);

  // An older version being looked at in the history panel. It belongs to one
  // riff, so it stops applying as soon as another riff is opened.
  const [preview, setPreview] = useState<{
    riffId: string;
    version: RiffVersion;
  } | null>(null);
  const previewed =
    draft && preview?.riffId === draft.id ? preview.version : null;

  // Opening another riff ends the preview for good, so coming back to this
  // one later shows its current version rather than the old one.
  const draftId = draft?.id ?? null;
  useEffect(() => {
    setPreview(null);
  }, [draftId]);

  // Over the video, the previewed version stands in for the riff's own words.
  const videoRiffs = useMemo(
    () =>
      previewed && draft
        ? riffs.map(riff =>
            riff.id === draft.id
              ? { ...riff, text: previewed.text, styling: previewed.styling }
              : riff,
          )
        : riffs,
    [riffs, draft, previewed],
  );

  // A riff that was just added is ready to be typed into.
  useEffect(() => {
    if (!focusTextId || draft?.id !== focusTextId) return;
    textRef.current?.focus();
    clearFocusText();
  }, [focusTextId, draft?.id, clearFocusText]);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-6 lg:flex-row lg:gap-6">
      {/* Video column: never scrolls, the video shrinks to fit it. */}
      <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:flex-1">
        <header className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard"
            className="shrink-0 text-sm text-white/60 hover:text-white"
          >
            ← Dashboard
          </Link>
          <h1 className="truncate text-lg font-semibold">{projectTitle}</h1>
        </header>

        <VideoCard riffs={videoRiffs} videoId={videoId} />

        <div className="flex min-w-0 items-center gap-x-4 gap-y-2">
          <Button
            size="sm"
            isLoading={editor.isAdding}
            onClick={() => void editor.addAtPlayhead()}
          >
            + Riff
          </Button>
          <Playhead />
          <ShortcutHints />
        </div>
      </div>

      {/* Editor panels: scroll on their own beside (or under) the video. */}
      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto pr-2 lg:w-[27rem] lg:flex-none 2xl:w-[29rem]">
        {editor.error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
          >
            <span>{editor.error}</span>
            <button
              type="button"
              onClick={editor.dismissError}
              className="cursor-pointer underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {riffs.length === 0 && (
          <p className="text-sm text-white/60">
            This project has no riffs yet. Play the video and press{' '}
            <kbd className="rounded bg-white/10 px-1 font-mono">T</kbd> or “+
            Riff” where the first one should appear.
          </p>
        )}

        {riffs.length > 0 && !draft && (
          <p className="text-sm text-white/60">Select a riff to edit it.</p>
        )}

        {draft && (
          <>
            <RiffControls
              riff={draft}
              onChange={editor.changeDraft}
              onSave={() => void editor.save()}
              onRevert={editor.revert}
              onDelete={() => editor.remove(draft.id)}
              isDirty={editor.isDirty}
              isSaving={editor.isSaving}
              disabled={editor.isRestoring}
            />

            <TimingControls
              riff={draft}
              overlaps={editor.overlappingIds.has(draft.id)}
              isSaving={editor.isSavingTiming}
              onChange={editor.changeTiming}
              onNudge={editor.nudge}
              onSetIn={editor.setInPoint}
              onSetOut={editor.setOutPoint}
            />

            <AnnotationForm
              riff={draft}
              onChange={editor.changeDraft}
              textRef={textRef}
              disabled={editor.isRestoring}
            />

            <AudioPanel />

            <RevisionPanel
              // Each riff has its own history, so start the panel afresh.
              key={draft.id}
              riff={draft}
              previewed={previewed}
              onPreview={version =>
                setPreview(version ? { riffId: draft.id, version } : null)
              }
              onRestore={editor.restoreVersion}
              isRestoring={editor.isRestoring}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default EditorWorkspace;
