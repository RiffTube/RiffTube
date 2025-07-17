import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import type { DummyRiff } from '../../data/dummyRiffs';
import AnnotationForm from './components/AnnotationForm';
import AudioPanel from './components/AudioPanel';
import RevisionPanel from './components/RevisionPanel';
import RiffControls from './components/RiffControls';
import VideoCard from './components/VideoCard';

interface Props {
  selectedId: string | null;
  riffs: DummyRiff[];
  setRiffs: React.Dispatch<React.SetStateAction<DummyRiff[]>>;
}

function EditorWorkspace({ selectedId, riffs, setRiffs }: Props) {
  const [original, setOriginal] = useState<DummyRiff | null>(
    () => riffs.find(r => r.id === selectedId) ?? null,
  );

  const [draft, setDraft] = useState<DummyRiff | null>(original);

  useEffect(() => {
    const next = riffs.find(r => r.id === selectedId) ?? null;
    setOriginal(next);
    setDraft(next);
  }, [selectedId, riffs]);

  const handleSave = (changes: Partial<DummyRiff>) => {
    if (!draft) return;
    const updated = { ...draft, ...changes };

    setOriginal(updated);
    setDraft(updated);

    const newRiffs = riffs.map(r => (r.id === updated.id ? updated : r));
    setRiffs(newRiffs);

    // TODO: hook this up to our PATCH /api/riffs/:id endpoint
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEV] riff saved:', updated);
    }
  };

  const handleUndo = () => {
    setDraft(original);
  };

  const handleRevisionSelect = async (revisionId: string) => {
    if (!original) return;

    if (revisionId === 'current') {
      setDraft(original);
      return;
    }

    // TODO: actually fetch this from /api…
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[DEV] would load revision ${revisionId} for riff ${original.id}`,
      );
    }

    const simulatedRevision: DummyRiff = {
      ...original,
      title: `${original.title} (rev ${revisionId})`,
      text: original.text
        ? `${original.text} [loaded ${revisionId}]`
        : undefined,
    };

    setDraft(simulatedRevision);
  };

  const isDirty: boolean =
    draft !== null &&
    original !== null &&
    !isEqual(
      { title: draft.title, duration: draft.duration, text: draft.text },
      {
        title: original.title,
        duration: original.duration,
        text: original.text,
      },
    );
  return (
    <main className="flex min-w-0 flex-1 flex-col p-6">
      <div className="mb-6">
        <VideoCard riffs={riffs} selectedId={selectedId} />
      </div>

      {/* Editor panels (scrollable) */}
      <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto pr-2 md:pr-4">
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

            <RevisionPanel riff={draft} onSelect={handleRevisionSelect} />
          </>
        )}
      </div>
    </main>
  );
}

export default EditorWorkspace;
