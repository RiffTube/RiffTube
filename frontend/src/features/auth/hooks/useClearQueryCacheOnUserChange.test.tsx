import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { UserDTO } from '@/features/auth/services/authApi';
import { mockAuthState, resetUseAuthMock } from '@/testUtils/mockUseAuth';
import { useClearQueryCacheOnUserChange } from './useClearQueryCacheOnUserChange';

const alice: UserDTO = {
  id: 'u1',
  username: 'alice',
  email: 'alice@example.com',
};
const bob: UserDTO = { id: 'u2', username: 'bob', email: 'bob@example.com' };

function setup() {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['projects'], [{ id: 'p1', title: 'Movie Night' }]);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { rerender } = renderHook(() => useClearQueryCacheOnUserChange(), {
    wrapper,
  });

  const cached = () => queryClient.getQueryData(['projects']);
  return { cached, rerender };
}

describe('useClearQueryCacheOnUserChange', () => {
  beforeEach(resetUseAuthMock);

  it('keeps the cache while the same account stays signed in', () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { cached, rerender } = setup();

    rerender();

    expect(cached()).toBeDefined();
  });

  it('drops cached data when a different account signs in', () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { cached, rerender } = setup();

    mockAuthState({ state: 'authorized', user: bob });
    rerender();

    expect(cached()).toBeUndefined();
  });

  it('drops cached data on sign-out', () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { cached, rerender } = setup();

    mockAuthState({ state: 'unauthorized', user: null });
    rerender();

    expect(cached()).toBeUndefined();
  });

  it('keeps the cache while auth is still resolving', () => {
    mockAuthState({ state: 'authorized', user: alice });
    const { cached, rerender } = setup();

    mockAuthState({ state: 'loading', user: null });
    rerender();

    expect(cached()).toBeDefined();
  });
});
