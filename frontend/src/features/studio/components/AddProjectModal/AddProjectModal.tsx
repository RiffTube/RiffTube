import Modal from '@/components/Modal';
import type { ProjectDTO } from '../../services/projectsApi';
import AddProjectForm from '../AddProjectForm';

export interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: ProjectDTO) => void;
  initialYoutubeUrl?: string;
}

function AddProjectModal({
  isOpen,
  onClose,
  onCreated,
  initialYoutubeUrl,
}: AddProjectModalProps) {
  const handleSuccess = (project: ProjectDTO) => {
    onCreated?.(project);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <h2 className="text-2xl font-semibold">New project</h2>
      <AddProjectForm
        onSuccess={handleSuccess}
        initialYoutubeUrl={initialYoutubeUrl}
        className="mt-6"
      />
    </Modal>
  );
}

export default AddProjectModal;
