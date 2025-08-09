import { vi } from 'vitest';
import type { UserDTO } from '@/features/auth/services/authApi';

export type UseAuthShape = {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;

  clearError: () => void;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const useAuthMock = vi.fn<() => UseAuthShape>();

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

export function mockAuthState(
  overrides: Partial<UseAuthShape> = {},
): UseAuthShape {
  const defaultState: UseAuthShape = {
    user: null,
    isAuthenticated: false,
    isInitialized: true,
    loading: false,
    error: null,
    clearError: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshMe: vi.fn(),
  };

  const value: UseAuthShape = { ...defaultState, ...overrides };
  useAuthMock.mockReturnValue(value);
  return value;
}

export function mockAuthSignIn(
  overrides: Partial<
    Pick<UseAuthShape, 'signIn' | 'loading' | 'error' | 'clearError'>
  > = {},
): UseAuthShape {
  return mockAuthState({
    signIn:
      overrides.signIn ??
      vi
        .fn<(login: string, password: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    loading: overrides.loading ?? false,
    error: overrides.error ?? null,
    clearError: overrides.clearError ?? vi.fn(),
  });
}

export function mockAuthSignUp(
  overrides: Partial<
    Pick<UseAuthShape, 'signUp' | 'loading' | 'error' | 'clearError'>
  > = {},
): UseAuthShape {
  return mockAuthState({
    signUp:
      overrides.signUp ??
      vi
        .fn<(u: string, e: string, p: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    loading: overrides.loading ?? false,
    error: overrides.error ?? null,
    clearError: overrides.clearError ?? vi.fn(),
  });
}

export function resetUseAuthMock(): void {
  useAuthMock.mockReset();
}
