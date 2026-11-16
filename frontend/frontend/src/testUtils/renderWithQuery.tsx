import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

interface Options {
  /** Initial URL, e.g. "/dashboard/projects/p1" */
  route?: string;
  /** Route pattern the element is mounted at, e.g. "/dashboard/projects/:projectId" */
  path?: string;
  /** Pages visited before `route`, oldest first, so tests can go Back */
  history?: string[];
}

/**
 * Renders inside a fresh QueryClient (no retries, no cache sharing) and an
 * in-memory data router. Any other URL shows "Another page", so tests can tell
 * that navigation happened. The client and router are returned so tests can
 * drive refetches and navigation.
 */
export function renderWithQuery(
  ui: ReactElement,
  { route = '/', path = '*', history = [] }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path, element: ui },
      ...(path === '*' ? [] : [{ path: '*', element: <p>Another page</p> }]),
    ],
    { initialEntries: [...history, route], initialIndex: history.length },
  );

  return {
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
  };
}
