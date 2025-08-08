import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

function AuthSuccessPage() {
  const { refreshMe, isAuthenticated } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      nav('/');
      return;
    }
    refreshMe().finally(() => nav('/demo')); // TODO: redirect to the live editor
  }, [isAuthenticated, refreshMe, nav]);

  return <p className="mt-20 text-center">Logging you in…</p>;
}
export default AuthSuccessPage;
