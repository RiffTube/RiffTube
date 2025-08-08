import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ApiError,
  signIn as apiSignIn,
  signUp as apiSignUp,
} from '@/features/auth/services/authApi';
import type {
  ApiUserResponse,
  UserDTO,
} from '@/features/auth/services/authApi';

export type User = UserDTO;

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | null>(null);

interface HasStatus {
  status?: number;
}

interface HasResponseStatus {
  response?: {
    status?: number;
  };
}

function getStatus(err: unknown): number | undefined {
  if (err instanceof ApiError) return err.status;

  if (typeof err === 'object' && err !== null) {
    const maybeStatus = err as HasStatus;
    if (typeof maybeStatus.status === 'number') return maybeStatus.status;

    const maybeResp = err as HasResponseStatus;
    if (typeof maybeResp.response?.status === 'number') {
      return maybeResp.response.status;
    }
  }
  return undefined;
}

function normalizeAuthError(err: unknown): string {
  const status = getStatus(err);

  if (status === 401 || status === 403) {
    return 'Email/username or password is incorrect.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'Something went wrong on our end. Please try again.';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Unable to complete the request. Please try again.';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/users/me', { credentials: 'include' });
        if (res.ok) {
          const json = (await res.json()) as ApiUserResponse;
          setUser(json.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(async (login: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const json = await apiSignIn({ login, password });
      setUser(json.user);
    } catch (err: unknown) {
      setError(normalizeAuthError(err));
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
        const json = await apiSignUp({ username, email, password });
        setUser(json.user);
      } catch (err: unknown) {
        setError(normalizeAuthError(err));
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
    clearError,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextShape => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
