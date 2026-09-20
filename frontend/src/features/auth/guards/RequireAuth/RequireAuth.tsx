import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function RequireAuth() {
  const { user, state } = useAuth();
  const location = useLocation();

  // Wait for auth to finish initializing
  // can be inited with user briefly null
  // due to setState call in async function(?)
  if (state === 'loading' || (state === 'authorized' && !user)) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (state === 'authorized' && user) {
    return <Outlet />;
  }
  return <Navigate to="/" replace state={{ from: location }} />;
}
