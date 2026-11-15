import type { ReactNode } from 'react';
import { useClearQueryCacheOnUserChange } from '../../hooks/useClearQueryCacheOnUserChange';

/** Keeps the query cache tied to the signed-in account. Render inside both providers. */
function AuthScopedCache({ children }: { children: ReactNode }) {
  useClearQueryCacheOnUserChange();
  return <>{children}</>;
}

export default AuthScopedCache;
