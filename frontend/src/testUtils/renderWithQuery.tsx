import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

interface Options {
  /** Initial URL, e.g. "/dashboard/projects/p1" */
  route?: string;
  /** Route pattern the element is mounted at, e.g. "/dashboard/projects/:projectId" */
  path?: string;
}

/** Renders inside a fresh QueryClient (no retries, no cache sharing) and a MemoryRouter. */
export function renderWithQuery(
  ui: ReactElement,
  { route = '/', path = '*' }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
