import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PlayerProvider } from '@/features/player/context';
import { useRiffs } from '@/features/riffs/hooks';
import type { Riff } from '@/features/riffs/types';
import { useProject } from '@/features/studio/hooks';
import {
  ApiError,
  type ProjectDTO,
} from '@/features/studio/services/projectsApi';
import EditorWorkspace from '../../components/EditorWorkspace';
import RiffSidebar from '../../components/RiffSidebar';
import UndoToast from '../../components/UndoToast';
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts';
import { useRiffEditor } from '../../hooks/useRiffEditor';

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
        <Link
          to="/dashboard"
          className="rounded-[2px] underline underline-offset-4 hover:text-gold"
        >
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

  // Keyed so switching projects starts a fresh editor and player.
  return (
    <PlayerProvider key={project.data.id}>
      <LoadedEditor project={project.data} fetchedRiffs={riffs.data} />
    </PlayerProvider>
  );
}

interface LoadedEditorProps {
  project: ProjectDTO;
  fetchedRiffs: Riff[];
}

function LoadedEditor({ project, fetchedRiffs }: LoadedEditorProps) {
  const editor = useRiffEditor(project.id, fetchedRiffs);
  const handleKeyDown = useEditorShortcuts(editor);
  const container = useRef<HTMLDivElement>(null);

  // Shortcuts are handled here, so start with focus inside the editor.
  useEffect(() => {
    container.current?.focus();
  }, []);

  // Show unsaved edits everywhere the selected riff appears.
  const { riffs, draft } = editor;
  const shownRiffs = useMemo(
    () => riffs.map(riff => (draft && riff.id === draft.id ? draft : riff)),
    [riffs, draft],
  );

  return (
    <div
      ref={container}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="flex h-screen bg-ink text-paper outline-none"
    >
      <RiffSidebar
        riffs={shownRiffs}
        selectedId={editor.selectedId}
        overlappingIds={editor.overlappingIds}
        onSelect={editor.select}
      />
      <EditorWorkspace
        projectTitle={project.title}
        videoId={project.videoId}
        riffs={shownRiffs}
        editor={editor}
      />
      {editor.pendingDelete && (
        <UndoToast message="Riff deleted." onUndo={editor.undoDelete} />
      )}
    </div>
  );
}

function EditorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-ink text-paper">
      {children}
    </div>
  );
}

export default EditorPage;
