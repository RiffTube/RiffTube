import { act, screen } from '@testing-library/react';
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

/** TanStack delivers cache updates on a later tick; let them land. */
const flushQueryUpdates = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

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

  it('keeps the editor and local edits when a background refetch fails', async () => {
    server.use(...projectHandlers(project, riffs));
    const { queryClient } = renderEditor();
    const user = userEvent.setup();
    await screen.findByRole('heading', { name: 'Movie Night' });

    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'Edited');

    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({ error: 'boom' }, { status: 500 }),
      ),
    );
    await act(() => queryClient.refetchQueries());
    await flushQueryUpdates();

    expect(
      screen.getByRole('heading', { name: 'Movie Night' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Edited');
  });

  it('adopts refreshed riffs while nothing has been edited', async () => {
    server.use(...projectHandlers(project, riffs));
    const { queryClient } = renderEditor();
    await screen.findByText('wait');

    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [makeRiff({ id: 'r3', title: 'Fresh from the server' })],
        }),
      ),
    );
    await act(() => queryClient.refetchQueries());

    expect(
      await screen.findByText('Fresh from the server'),
    ).toBeInTheDocument();
    expect(screen.queryByText('wait')).toBeNull();
  });

  it('leaves local edits alone when a refresh arrives', async () => {
    server.use(...projectHandlers(project, riffs));
    const { queryClient } = renderEditor();
    const user = userEvent.setup();
    await screen.findByText('wait');

    await user.clear(screen.getByLabelText(/Name/i));
    await user.type(screen.getByLabelText(/Name/i), 'Edited');

    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [makeRiff({ id: 'r3', title: 'Fresh from the server' })],
        }),
      ),
    );
    await act(() => queryClient.refetchQueries());
    await flushQueryUpdates();

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Edited');
    expect(screen.queryByText('Fresh from the server')).toBeNull();
  });

  it('keeps an annotation edit that a refresh interrupts before the debounce', async () => {
    server.use(...projectHandlers(project, riffs));
    const { queryClient } = renderEditor();
    const user = userEvent.setup({ delay: null });
    await screen.findByText('wait');

    const annotation = screen.getByPlaceholderText(/type riff text/i);
    await user.type(annotation, '!');

    // The refresh lands while the form's 300ms debounce is still pending.
    server.use(
      http.get('*/api/v1/projects/p1/riffs', () =>
        HttpResponse.json({
          riffs: [makeRiff({ id: 'r3', title: 'Fresh from the server' })],
        }),
      ),
    );
    await act(() => queryClient.refetchQueries());
    await flushQueryUpdates();

    expect(annotation).toHaveValue('Wait for it...!');
    expect(screen.queryByText('Fresh from the server')).toBeNull();
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
