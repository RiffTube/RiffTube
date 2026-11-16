import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';
import { usePlayerTime } from '@/features/player/context';
import type { Riff } from '@/features/riffs/types';
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

function EditorWorkspace({ projectTitle, videoId, riffs, editor }: Props) {
  const { draft, focusTextId, clearFocusText } = editor;
  const textRef = useRef<HTMLTextAreaElement>(null);

  // A riff that was just added is ready to be typed into.
  useEffect(() => {
    if (!focusTextId || draft?.id !== focusTextId) return;
    textRef.current?.focus();
    clearFocusText();
  }, [focusTextId, draft?.id, clearFocusText]);

  return (
    <main className="flex min-w-0 flex-1 flex-col p-6">
      <header className="mb-4 flex min-w-0 items-center gap-3">
        <Link
          to="/dashboard"
          className="shrink-0 text-sm text-white/60 hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="truncate text-lg font-semibold">{projectTitle}</h1>
      </header>

      <div className="mb-3">
        <VideoCard riffs={riffs} videoId={videoId} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          size="sm"
          isLoading={editor.isAdding}
          onClick={() => void editor.addAtPlayhead()}
        >
          + Riff
        </Button>
        <Playhead />
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
          {SHORTCUTS.map(([keys, action]) => (
            <li key={keys}>
              <kbd className="rounded bg-white/10 px-1 font-mono text-white/70">
                {keys}
              </kbd>{' '}
              {action}
            </li>
          ))}
        </ul>
      </div>

      {editor.error && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100"
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

      {/* Editor panels (scrollable) */}
      <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto pr-2 md:pr-4">
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
            />

            <AudioPanel />

            <RevisionPanel riff={draft} />
          </>
        )}
      </div>
    </main>
  );
}

export default EditorWorkspace;
