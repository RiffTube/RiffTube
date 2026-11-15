import { useEffect, useState } from 'react';
import { isEqual, pick } from 'lodash';
import { Link } from 'react-router-dom';
import type { Riff } from '@/features/riffs/types';
import AnnotationForm from './components/AnnotationForm';
import AudioPanel from './components/AudioPanel';
import RevisionPanel from './components/RevisionPanel';
import RiffControls from './components/RiffControls';
import VideoCard from './components/VideoCard';

interface Props {
  projectTitle: string;
  /** YouTube id of the project's video */
  videoId: string | null;
  selectedId: string | null;
  riffs: Riff[];
  setRiffs: React.Dispatch<React.SetStateAction<Riff[]>>;
  /** Told whether the draft differs from the saved riff. */
  onDirtyChange?: (dirty: boolean) => void;
}

const EDITABLE_FIELDS = ['title', 'text', 'start', 'end'] as const;

function EditorWorkspace({
  projectTitle,
  videoId,
  selectedId,
  riffs,
  setRiffs,
  onDirtyChange,
}: Props) {
  const [original, setOriginal] = useState<Riff | null>(
    () => riffs.find(r => r.id === selectedId) ?? null,
  );

  const [draft, setDraft] = useState<Riff | null>(original);

  useEffect(() => {
    const next = riffs.find(r => r.id === selectedId) ?? null;
    setOriginal(next);
    setDraft(next);
  }, [selectedId, riffs]);

  const handleSave = (changes: Partial<Riff>) => {
    if (!draft) return;
    const updated = { ...draft, ...changes };

    setOriginal(updated);
    setDraft(updated);

    const newRiffs = riffs.map(r => (r.id === updated.id ? updated : r));
    setRiffs(newRiffs);

    // TODO: persist with PATCH /api/v1/projects/:projectId/riffs/:id
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEV] riff saved locally:', updated);
    }
  };

  const handleUndo = () => {
    setDraft(original);
  };

  const isDirty: boolean =
    draft !== null &&
    original !== null &&
    !isEqual(pick(draft, EDITABLE_FIELDS), pick(original, EDITABLE_FIELDS));

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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

      <div className="mb-6">
        <VideoCard riffs={riffs} selectedId={selectedId} videoId={videoId} />
      </div>

      {/* Editor panels (scrollable) */}
      <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto pr-2 md:pr-4">
        {riffs.length === 0 && (
          <p className="text-sm text-white/60">
            This project has no riffs yet.
          </p>
        )}

        {draft && (
          <>
            <RiffControls
              riff={draft}
              onChange={setDraft}
              onSave={handleSave}
              onUndo={handleUndo}
              canSave={isDirty}
            />

            <AudioPanel />

            <AnnotationForm
              riff={draft}
              onChange={updated =>
                setDraft(prev => (prev ? { ...prev, ...updated } : prev))
              }
            />

            <RevisionPanel riff={draft} />
          </>
        )}
      </div>
    </main>
  );
}

export default EditorWorkspace;
