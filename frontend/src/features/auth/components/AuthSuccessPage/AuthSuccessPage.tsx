import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

function AuthSuccessPage() {
  const { refreshMe, state } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (state === 'authorized') {
      nav('/');
      return;
    }

    refreshMe().finally(() => nav('/dashboard'));
  }, [state, refreshMe, nav]);

  return <p className="mt-20 text-center">Logging you in…</p>;
}
export default AuthSuccessPage;
