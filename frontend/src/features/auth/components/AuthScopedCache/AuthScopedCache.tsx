import { Fragment, type ReactNode } from 'react';
import { useAccountScopedCache } from '../../hooks/useAccountScopedCache';

/**
 * Ties cached and in-memory data to the signed-in account: the query cache is
 * cleared on an identity change, and the keyed Fragment remounts everything
 * below so no component keeps the previous account's data in local state.
 * Render inside both the QueryClientProvider and the AuthProvider.
 */
function AuthScopedCache({ children }: { children: ReactNode }) {
  const generation = useAccountScopedCache();

  return <Fragment key={generation}>{children}</Fragment>;
}

export default AuthScopedCache;
