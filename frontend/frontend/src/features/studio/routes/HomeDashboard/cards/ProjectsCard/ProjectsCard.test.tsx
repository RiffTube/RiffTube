import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { renderWithQuery } from '@/testUtils/renderWithQuery';
import { makeProject, server } from '@/testUtils/server';
import ProjectsCard from './ProjectsCard';

const respondWith = (body: Record<string, unknown>, status = 200) =>
  server.use(
    http.get('*/api/v1/projects', () => HttpResponse.json(body, { status })),
  );

describe('<ProjectsCard />', () => {
  it('lists the projects from the API, each linking to its editor', async () => {
    respondWith({
      projects: [
        makeProject({ id: 'p1', title: 'Movie Night' }),
        makeProject({ id: 'p2', title: 'No Video Yet', videoId: null }),
      ],
    });
    renderWithQuery(<ProjectsCard />);

    const first = await screen.findByRole('link', { name: /movie night/i });
    expect(first).toHaveAttribute('href', '/dashboard/projects/p1');
    expect(within(first).getByText(/updated/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /no video yet/i })).toHaveAttribute(
      'href',
      '/dashboard/projects/p2',
    );
  });

  it('invites the user to create a project when there are none', async () => {
    respondWith({ projects: [] });
    renderWithQuery(<ProjectsCard />);

    expect(
      await screen.findByRole('link', { name: /create your first project/i }),
    ).toHaveAttribute('href', '/dashboard/projects/new');
  });

  it('shows an error when the list cannot be loaded', async () => {
    respondWith({ error: 'boom' }, 500);
    renderWithQuery(<ProjectsCard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn’t load your projects/i,
    );
  });
});
