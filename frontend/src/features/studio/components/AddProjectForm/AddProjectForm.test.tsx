import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { createProject } from '../../services/projectsApi';
import AddProjectForm from './AddProjectForm';

vi.mock('../../services/projectsApi', () => ({
  createProject: vi.fn(),
}));

const createProjectMock = vi.mocked(createProject);

const project = {
  id: 'demo-project-id',
  title: 'Guitar Solo Breakdown',
  videoHost: 'youtube',
  videoId: 'dQw4w9WgXcQ',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  visibility: 'private',
};

describe('<AddProjectForm />', () => {
  beforeEach(() => {
    createProjectMock.mockReset();
  });

  it('renders inputs and a disabled submit button initially', () => {
    render(<AddProjectForm />);

    expect(screen.getByLabelText(/project title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/youtube url/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /create project/i }),
    ).toBeDisabled();
  });

  it('enables submit once title and a valid YouTube URL are entered, then calls createProject and onSuccess', async () => {
    const user = userEvent.setup();
    createProjectMock.mockResolvedValue(project);
    const onSuccess = vi.fn();

    render(<AddProjectForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/project title/i), 'My Project');
    await user.type(
      screen.getByLabelText(/youtube url/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );

    const submit = screen.getByRole('button', { name: /create project/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    await waitFor(() =>
      expect(createProjectMock).toHaveBeenCalledWith({
        title: 'My Project',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      }),
    );
    expect(onSuccess).toHaveBeenCalledWith(project);
  });

  it('keeps submit disabled for a non-YouTube URL', async () => {
    const user = userEvent.setup();

    render(<AddProjectForm />);

    await user.type(screen.getByLabelText(/project title/i), 'My Project');
    await user.type(
      screen.getByLabelText(/youtube url/i),
      'https://example.com/not-youtube',
    );

    expect(
      screen.getByRole('button', { name: /create project/i }),
    ).toBeDisabled();
  });

  it('pre-fills the YouTube URL field from initialYoutubeUrl', () => {
    render(<AddProjectForm initialYoutubeUrl="https://youtu.be/dQw4w9WgXcQ" />);

    expect(screen.getByLabelText(/youtube url/i)).toHaveValue(
      'https://youtu.be/dQw4w9WgXcQ',
    );
  });

  it('shows an error message when createProject rejects', async () => {
    const user = userEvent.setup();
    createProjectMock.mockRejectedValue(
      new Error('Title has already been taken'),
    );

    render(<AddProjectForm />);

    await user.type(screen.getByLabelText(/project title/i), 'My Project');
    await user.type(
      screen.getByLabelText(/youtube url/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    await user.click(screen.getByRole('button', { name: /create project/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /title has already been taken/i,
    );
  });
});
