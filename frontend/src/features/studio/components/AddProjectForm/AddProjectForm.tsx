import { useState } from 'react';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { candidateYouTubeUrl } from '@/helpers/youtube';
import { createProject, type ProjectDTO } from '../../services/projectsApi';

const YOUTUBE_URL_PATTERN =
  'https?://(www\\.)?(youtube\\.com/(watch\\?v=[\\w-]+|shorts/[\\w-]+|live/[\\w-]+|embed/[\\w-]+)|youtu\\.be/[\\w-]+).*';

export interface AddProjectFormProps {
  onSuccess?: (project: ProjectDTO) => void;
  initialYoutubeUrl?: string;
  className?: string;
}

function AddProjectForm({
  onSuccess,
  initialYoutubeUrl = '',
  className = '',
}: AddProjectFormProps) {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleTrim = title.trim();
  const normalizedUrl = candidateYouTubeUrl(youtubeUrl);

  const titleValid = titleTrim.length > 0;
  const urlValid = normalizedUrl !== null;
  const isFormInvalid = !(titleValid && urlValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid || loading || !normalizedUrl) return;

    setLoading(true);
    setError(null);
    try {
      const project = await createProject({
        title: titleTrim,
        videoUrl: normalizedUrl,
      });
      onSuccess?.(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setTitle(e.target.value);
  };

  const onYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setYoutubeUrl(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <TextInput
        id="add-project-title"
        label="Project title"
        value={title}
        onChange={onTitleChange}
        placeholder="Give your project a name"
        required
        errorMessage="Enter a project title"
      />

      <TextInput
        id="add-project-youtube-url"
        label="YouTube URL"
        value={youtubeUrl}
        onChange={onYoutubeUrlChange}
        placeholder="https://www.youtube.com/watch?v=..."
        required
        pattern={YOUTUBE_URL_PATTERN}
        errorMessage="Enter a valid YouTube video, short, or live link"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="mt-4 w-full"
        disabled={isFormInvalid || loading}
        isLoading={loading}
      >
        Create project
      </Button>
    </form>
  );
}

export default AddProjectForm;
