import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserDTO } from '@/features/auth/services/authApi';
import { mockAuthState, resetUseAuthMock } from '@/testUtils/mockUseAuth';
import AuthScopedCache from './AuthScopedCache';

const alice: UserDTO = {
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
};
const bob: UserDTO = { id: 'u2', username: 'bob', email: 'bob@example.com' };

/** Stands in for anything holding the signed-in account's data in local state. */
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(previous => previous + 1)}>
      count {count}
    </button>
  );
}

function renderScoped() {
  const queryClient = new QueryClient();
  // A fresh element each time: React skips re-rendering an identical one,
  // which would hide the auth change this component is meant to react to.
  const tree = () => (
    <QueryClientProvider client={queryClient}>
      <AuthScopedCache>
        <Counter />
      </AuthScopedCache>
    </QueryClientProvider>
  );

  const { rerender } = render(tree());
  return { rerender: () => rerender(tree()) };
}

describe('<AuthScopedCache />', () => {
  beforeEach(resetUseAuthMock);

  it('keeps local state while the same account stays signed in', async () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { rerender } = renderScoped();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('count 1');

    rerender();

    expect(screen.getByRole('button')).toHaveTextContent('count 1');
  });

  it('remounts its children when another account signs in', async () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { rerender } = renderScoped();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('count 1');

    mockAuthState({ state: 'authorized', user: bob });
    rerender();

    expect(screen.getByRole('button')).toHaveTextContent('count 0');
  });

  it('remounts its children on sign-out', async () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { rerender } = renderScoped();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));

    mockAuthState({ state: 'unauthorized', user: null });
    rerender();

    expect(screen.getByRole('button')).toHaveTextContent('count 0');
  });
});
