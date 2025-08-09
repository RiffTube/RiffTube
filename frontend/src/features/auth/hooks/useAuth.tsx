import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
interface HttpishError {
  response?: { status?: number };
  message?: string;
}

function isHttpishError(err: unknown): err is HttpishError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { status?: number } }).response?.status ===
      'number'
  );
}

interface AuthContextShape {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  clearError: () => void;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | null>(null);

function normalizeAuthError(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
      case 403:
        return 'Email/username or password is incorrect.';
      case 409:
        return 'An account with this email or username already exists.';
      case 422:
        return 'Please check your input and try again.';
      case 429:
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return err.message || 'Authentication failed.';
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (isHttpishError(err)) {
    if (err.response!.status && err.response!.status >= 500) {
      return 'Something went wrong on our end. Please try again.';
    }
    if (err.message) {
      return err.message;
    }
  }

  return 'Unable to complete the request. Please try again.';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const abortController = useRef<AbortController | null>(null);

  const refreshMe = useCallback(async () => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    if (!isInitialized) {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/v1/me', {
        credentials: 'include',
        signal: abortController.current.signal,
      });

      if (res.ok) {
        const json = (await res.json()) as ApiUserResponse;
        setUser(json.user);
      } else if (res.status === 401) {
        setUser(null);
      } else {
        setUser(null);
        console.warn(`Auth check failed with status: ${res.status}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setUser(null);
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
      setIsInitialized(true);
      abortController.current = null;
    }
  }, [isInitialized]);

  useEffect(() => {
    void refreshMe();

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [refreshMe]);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(async (login: string, password: string) => {
    if (!login.trim() || !password.trim()) {
      const errorMsg = 'Please provide both email/username and password.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setError(null);
    setLoading(true);
    try {
      const json = await apiSignIn({ login: login.trim(), password });
      setUser(json.user);
    } catch (err: unknown) {
      const errorMsg = normalizeAuthError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (username: string, email: string, password: string) => {
      if (!username.trim() || !email.trim() || !password.trim()) {
        const errorMsg = 'All fields are required.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (password.length < 8) {
        const errorMsg = 'Password must be at least 8 characters long.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setError(null);
      setLoading(true);
      try {
        const json = await apiSignUp({
          username: username.trim(),
          email: email.trim(),
          password,
        });
        setUser(json.user);
      } catch (err: unknown) {
        const errorMsg = normalizeAuthError(err);
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/logout', {
        method: 'DELETE',
        credentials: 'include',
      });

      setUser(null);

      if (!response.ok) {
        console.warn(`Logout request failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextShape>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user && isInitialized),
      isInitialized,
      clearError,
      signIn,
      signUp,
      signOut,
      refreshMe,
    }),
    [
      user,
      loading,
      error,
      isInitialized,
      clearError,
      signIn,
      signUp,
      signOut,
      refreshMe,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextShape => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};
