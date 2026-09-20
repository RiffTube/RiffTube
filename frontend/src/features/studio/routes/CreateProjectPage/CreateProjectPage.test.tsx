import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { createProject } from '../../services/projectsApi';
import CreateProjectPage from './CreateProjectPage';

vi.mock('../../services/projectsApi', () => ({
  createProject: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-youtube', () => ({
  __esModule: true,
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-iframe" data-video-id={videoId} />
  ),
}));

const createProjectMock = vi.mocked(createProject);

const project = {
  id: 'demo-project-id',
  title: 'My Project',
  videoHost: 'youtube',
  videoId: 'dQw4w9WgXcQ',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  visibility: 'private',
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <CreateProjectPage />
    </MemoryRouter>,
  );

describe('<CreateProjectPage />', () => {
  beforeEach(() => {
    createProjectMock.mockReset();
    mockNavigate.mockReset();
  });

  it('renders heading and inputs, with submit disabled initially', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /create project/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/youtube url or id/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start riffing/i }),
    ).toBeDisabled();
  });

  it('shows a video preview once a valid YouTube URL is entered', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByLabelText(/youtube url or id/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );

    expect(screen.getByTestId('youtube-iframe')).toHaveAttribute(
      'data-video-id',
      'dQw4w9WgXcQ',
    );
  });

  it('accepts a bare video id', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/youtube url or id/i), 'dQw4w9WgXcQ');

    expect(screen.getByTestId('youtube-iframe')).toHaveAttribute(
      'data-video-id',
      'dQw4w9WgXcQ',
    );
  });

  it('creates the project and navigates to it on submit', async () => {
    const user = userEvent.setup();
    createProjectMock.mockResolvedValue(project);
    renderPage();

    await user.type(screen.getByLabelText(/^title/i), 'My Project');
    await user.type(
      screen.getByLabelText(/youtube url or id/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );

    const submit = screen.getByRole('button', { name: /start riffing/i });
    expect(submit).toBeEnabled();
    await user.click(submit);

    await waitFor(() =>
      expect(createProjectMock).toHaveBeenCalledWith({
        title: 'My Project',
        videoId: 'dQw4w9WgXcQ',
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      '/dashboard/projects/demo-project-id',
    );
  });

  it('shows an error message when createProject rejects', async () => {
    const user = userEvent.setup();
    createProjectMock.mockRejectedValue(new Error('Something went wrong'));
    renderPage();

    await user.type(screen.getByLabelText(/^title/i), 'My Project');
    await user.type(
      screen.getByLabelText(/youtube url or id/i),
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    await user.click(screen.getByRole('button', { name: /start riffing/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /something went wrong/i,
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
