import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import { renderWithQuery } from '@/testUtils/renderWithQuery';
import {
  makeProject,
  makeRiff,
  projectHandlers,
  server,
} from '@/testUtils/server';
import EditorPage from './EditorPage';

vi.mock('@/features/player/components/YouTubePlayer', () => ({
  default: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player">{videoId}</div>
  ),
}));

const project = makeProject({
  id: 'p1',
  title: 'Movie Night',
  videoId: 'abc123XYZ_-',
});
const riffs = [
  makeRiff(),
  makeRiff({ id: 'r2', title: 'Classic', start: 18, end: 25, text: 'Ha!' }),
];

const renderEditor = (projectId = project.id) =>
  renderWithQuery(<EditorPage />, {
    route: `/dashboard/projects/${projectId}`,
    path: '/dashboard/projects/:projectId',
  });

describe('<EditorPage />', () => {
  it('loads the project from the API and plays its video', async () => {
    server.use(...projectHandlers(project, riffs));
    renderEditor();

    expect(screen.getByRole('status')).toHaveTextContent(/loading project/i);

    expect(
      await screen.findByRole('heading', { name: 'Movie Night' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'abc123XYZ_-',
    );
  });

  it('lists the project riffs and selects the first one', async () => {
    server.use(...projectHandlers(project, riffs));
    renderEditor();

    expect(await screen.findByText('wait')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('wait');
  });

  it('updates the workspace when a different riff is clicked in the sidebar', async () => {
    server.use(...projectHandlers(project, riffs));
    renderEditor();
    const user = userEvent.setup();

    await user.click(await screen.findByText('Classic'));

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Classic');
  });

  it('copes with riffs that have no title or styling yet', async () => {
    server.use(
      http.get('*/api/v1/projects/p1', () => HttpResponse.json({ project })),
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [{ ...makeRiff(), title: null, styling: null }],
        }),
      ),
    );
    renderEditor();

    // Sidebar falls back to the text; the name field is simply empty
    expect(await screen.findByRole('listitem')).toHaveTextContent(
      'Wait for it...',
    );
    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
  });

  it('shows an empty state for a project without riffs', async () => {
    server.use(...projectHandlers(project, []));
    renderEditor();

    expect(await screen.findByText(/has no riffs yet/i)).toBeInTheDocument();
    expect(screen.getByTestId('youtube-player')).toBeInTheDocument();
  });

  it('shows "not found" when the API answers 404', async () => {
    server.use(
      http.get('*/api/v1/projects/nope', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
      http.get('*/api/v1/projects/nope/riffs', () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );
    renderEditor('nope');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /project not found/i,
    );
    expect(
      screen.getByRole('link', { name: /back to dashboard/i }),
    ).toHaveAttribute('href', '/dashboard');
  });

  it('shows a generic error when loading fails for another reason', async () => {
    server.use(
      http.get('*/api/v1/projects/p1', () => HttpResponse.json({ project })),
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    renderEditor();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /something went wrong/i,
    );
  });
});
