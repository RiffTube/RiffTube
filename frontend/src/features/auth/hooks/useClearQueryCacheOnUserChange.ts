import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Cached data belongs to the account that fetched it. The QueryClient outlives
 * sign-out and query keys carry no user id, so without this a second account
 * signing in on the same tab could read the first one's projects and riffs
 * straight from the cache. Drop everything whenever the signed-in user changes.
 */
export function useClearQueryCacheOnUserChange(): void {
  const { user, state } = useAuth();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Wait for the first /me answer; "loading" says nothing about identity.
    if (state === 'loading') return;

    const userId = user?.id ?? null;

    // First settled state of this page load: nothing cached under another user.
    if (previousUserId.current === undefined) {
      previousUserId.current = userId;
      return;
    }

    if (previousUserId.current === userId) return;

    previousUserId.current = userId;
    void queryClient.cancelQueries();
    queryClient.clear();
  }, [user?.id, state, queryClient]);
}
