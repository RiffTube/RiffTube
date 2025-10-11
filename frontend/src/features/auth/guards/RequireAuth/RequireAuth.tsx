import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function RequireAuth() {
  const { user, isInitialized } = useAuth();
  const location = useLocation();

  // Wait for auth to finish initializing
  // can be inited with user briefly null
  // due to setState call in async function(?)
  if (!isInitialized || !user) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  // here isInitialized must be true
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
