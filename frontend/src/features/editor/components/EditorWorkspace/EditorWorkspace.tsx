import { dummyRiffs } from '../../data/dummyRiffs';
import type { DummyRiff } from '../../data/dummyRiffs';
import AnnotationForm from './components/AnnotationForm';
import AudioPanel from './components/AudioPanel';
import RevisionPanel from './components/RevisionPanel';
import RiffControls from './components/RiffControls';
import VideoCard from './components/VideoCard';

interface Props {
  /** The id of the riff selected in the sidebar */
  selectedId: string | null;
}

function EditorWorkspace({ selectedId }: Props) {
  // find the currently selected riff (null if none)
  const selectedRiff: DummyRiff | null =
    dummyRiffs.find(r => r.id === selectedId) ?? null;

  return (
    <main className="flex min-w-0 flex-1 flex-col p-6">
      <div className="mb-6">
        {/* 1. Video player with overlay */}
        <VideoCard riffs={dummyRiffs} selectedId={selectedId} />
      </div>
      <div className="min-w-0 flex-1 space-y-8 overflow-x-hidden overflow-y-auto pr-2 md:pr-4">
        {/* 2. Basic controls (name, duration, save/undo) */}
        <RiffControls riff={selectedRiff} />

        {/* 3. Audio recording panel */}
        <AudioPanel riff={selectedRiff} />

        {/* 4. Annotation (text, style) editor */}
        <AnnotationForm riff={selectedRiff} />

        {/* 5. Revision history / advanced */}
        <RevisionPanel />
      </div>
    </main>
  );
}

export default EditorWorkspace;
