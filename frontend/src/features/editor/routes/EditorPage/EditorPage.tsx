import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRiffs } from '@/features/riffs/hooks';
import type { Riff } from '@/features/riffs/types';
import { useProject } from '@/features/studio/hooks';
import {
  ApiError,
  type ProjectDTO,
} from '@/features/studio/services/projectsApi';
import EditorWorkspace from '../../components/EditorWorkspace';
import RiffSidebar from '../../components/RiffSidebar';

function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId);
  const riffs = useRiffs(projectId);

  // Only a failure with nothing loaded replaces the editor: a background
  // refetch can also fail, and tearing the editor down would lose local edits.
  if (project.isLoadingError || riffs.isLoadingError) {
    const notFound =
      project.error instanceof ApiError && project.error.status === 404;
    return (
      <EditorMessage>
        <p role="alert">
          {notFound
            ? 'Project not found.'
            : 'Something went wrong loading this project.'}
        </p>
        <Link to="/dashboard" className="underline hover:text-white">
          Back to dashboard
        </Link>
      </EditorMessage>
    );
  }

  if (!project.data || !riffs.data) {
    return (
      <EditorMessage>
        <p role="status">Loading project…</p>
      </EditorMessage>
    );
  }

  // Keyed so switching projects starts from that project's riffs.
  return (
    <LoadedEditor
      key={project.data.id}
      project={project.data}
      fetchedRiffs={riffs.data}
    />
  );
}

interface LoadedEditorProps {
  project: ProjectDTO;
  fetchedRiffs: Riff[];
}

/** Edits stay in local state for now; saving to the API comes with the editing tools. */
function LoadedEditor({ project, fetchedRiffs }: LoadedEditorProps) {
  const [riffs, setRiffs] = useState(fetchedRiffs);
  const [selectedId, setSelectedId] = useState<string | null>(
    fetchedRiffs[0]?.id ?? null,
  );
  // Local state owns the riffs once the user touches them, so refreshed server
  // data is adopted only while this visit has changed nothing.
  const touched = useRef(false);

  useEffect(() => {
    if (touched.current) return;

    setRiffs(fetchedRiffs);
    setSelectedId(previous =>
      previous && fetchedRiffs.some(riff => riff.id === previous)
        ? previous
        : (fetchedRiffs[0]?.id ?? null),
    );
  }, [fetchedRiffs]);

  const handleRiffsChange: React.Dispatch<React.SetStateAction<Riff[]>> =
    useCallback(update => {
      touched.current = true;
      setRiffs(update);
    }, []);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    if (dirty) touched.current = true;
  }, []);

  return (
    <div className="flex h-screen bg-backstage text-white">
      <RiffSidebar
        riffs={riffs}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <EditorWorkspace
        projectTitle={project.title}
        videoId={project.videoId}
        riffs={riffs}
        setRiffs={handleRiffsChange}
        selectedId={selectedId}
        onDirtyChange={handleDirtyChange}
      />
    </div>
  );
}

function EditorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-backstage text-white/80">
      {children}
    </div>
  );
}

export default EditorPage;
