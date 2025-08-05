import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
} from '@/features/auth/services/authApi';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface ApiUserResponse {
  user: User;
}

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/users/me', { credentials: 'include' });
        if (res.ok) {
          const json: ApiUserResponse = await res.json();
          setUser(json.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (login: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const json: ApiUserResponse = await apiSignIn({ login, password });
      setUser(json.user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Try again.',
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      setError(null);
      setLoading(true);
      try {
        const json: ApiUserResponse = await apiSignUp({
          username,
          email,
          password,
        });
        setUser(json.user); // or keep null until confirmed
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to sign up. Try again.',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextShape = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export const useAuth = (): AuthContextShape => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
