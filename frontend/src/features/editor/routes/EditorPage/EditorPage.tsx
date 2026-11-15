import { useState, type ReactNode } from 'react';
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

  if (project.isError || riffs.isError) {
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

  if (project.isPending || riffs.isPending) {
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
      initialRiffs={riffs.data}
    />
  );
}

interface LoadedEditorProps {
  project: ProjectDTO;
  initialRiffs: Riff[];
}

/** Edits stay in local state for now; saving to the API comes with the editing tools. */
function LoadedEditor({ project, initialRiffs }: LoadedEditorProps) {
  const [riffs, setRiffs] = useState(initialRiffs);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRiffs[0]?.id ?? null,
  );

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
        setRiffs={setRiffs}
        selectedId={selectedId}
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
