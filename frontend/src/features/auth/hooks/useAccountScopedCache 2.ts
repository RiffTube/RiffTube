import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Keeps cached and in-memory data tied to the account that fetched it.
 *
 * The QueryClient outlives sign-out and query keys carry no user id, so without
 * this a second account signing in on the same tab could read the first one's
 * projects and riffs straight from the cache. Clearing the cache is not enough
 * on its own: mounted components keep their own copies (the editor's riff
 * snapshot, unsaved drafts), so this also returns a generation counter that
 * changes on every identity change, for callers to key account-scoped UI on and
 * force a remount.
 *
 * @returns a counter that increments whenever the signed-in user changes
 */
export function useAccountScopedCache(): number {
  const { user, state } = useAuth();
  const queryClient = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    // Wait for the first /me answer; "loading" says nothing about identity.
    if (state === 'loading') return;

    const userId = user?.id ?? null;

    // First settled state of this page load: nothing cached under another user,
    // so there is nothing to clear and nothing to remount.
    if (previousUserId.current === undefined) {
      previousUserId.current = userId;
      return;
    }

    if (previousUserId.current === userId) return;

    previousUserId.current = userId;
    void queryClient.cancelQueries();
    queryClient.clear();
    setGeneration(current => current + 1);
  }, [user?.id, state, queryClient]);

  return generation;
}
