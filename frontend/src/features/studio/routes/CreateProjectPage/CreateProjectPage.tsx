import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { extractYouTubeVideoId } from '@/helpers/youtube';
import { createProject } from '../../services/projectsApi';

function CreateProjectPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleTrim = title.trim();
  const videoId = extractYouTubeVideoId(youtubeInput);

  const titleValid = titleTrim.length > 0;
  const videoIdValid = videoId !== null;
  const isFormInvalid = !(titleValid && videoIdValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid || loading || !videoId) return;

    setLoading(true);
    setError(null);
    try {
      const project = await createProject({ title: titleTrim, videoId });
      navigate(`/dashboard/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setLoading(false);
    }
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setTitle(e.target.value);
  };

  const onYoutubeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setYoutubeInput(e.target.value);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-4xl text-white">Create Project</h1>

      <form onSubmit={handleSubmit} className="mt-8">
        <p className="mb-2 font-semibold text-white">Name your project</p>
        <TextInput
          id="create-project-title"
          label="Title"
          value={title}
          onChange={onTitleChange}
          placeholder="My first project"
          required
          errorMessage="Enter a project title"
        />

        <p className="mt-6 mb-2 font-semibold text-white">
          Paste the YouTube URL or ID of any video on YouTube
        </p>
        <TextInput
          id="create-project-youtube"
          label="YouTube URL or ID"
          value={youtubeInput}
          onChange={onYoutubeInputChange}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          errorMessage="Enter a valid YouTube URL or video ID"
        />

        {videoId && (
          <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <YouTube
              videoId={videoId}
              className="h-full w-full"
              opts={{ width: '100%', height: '100%' }}
            />
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={isFormInvalid || loading}
          isLoading={loading}
        >
          Start Riffing
        </Button>
      </form>
    </div>
  );
}

export default CreateProjectPage;
