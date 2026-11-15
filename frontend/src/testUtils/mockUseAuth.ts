import { vi } from 'vitest';
import type { UserDTO } from '@/features/auth/services/authApi';

export type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'error';

/** Mirrors AuthContextShape in features/auth/hooks/useAuth.tsx */
export type UseAuthShape = {
  user: UserDTO | null;
  error: string | null;
  state: AuthState;

  clearError: () => void;
  signIn: (login: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

/**
 * Overrides accepted by the helpers below. Besides the real fields, tests can
 * pass the older convenience flags (`isAuthenticated`, `loading`,
 * `isInitialized`); they are translated into `state` so existing tests keep
 * working. Prefer passing `state` directly in new tests.
 */
export type MockAuthOverrides = Partial<UseAuthShape> & {
  isAuthenticated?: boolean;
  loading?: boolean;
  isInitialized?: boolean;
};

export const useAuthMock = vi.fn<() => UseAuthShape>();

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

function resolveState(overrides: MockAuthOverrides): AuthState {
  if (overrides.state) return overrides.state;
  if (overrides.loading || overrides.isInitialized === false) return 'loading';
  if (overrides.isAuthenticated) return 'authorized';
  return 'unauthorized';
}

export function mockAuthState(overrides: MockAuthOverrides = {}): UseAuthShape {
  const rest: Partial<UseAuthShape> = { ...overrides };
  for (const key of ['isAuthenticated', 'loading', 'isInitialized']) {
    delete (rest as Record<string, unknown>)[key];
  }

  const defaultState: UseAuthShape = {
    user: null,
    error: null,
    state: 'unauthorized',
    clearError: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    refreshMe: vi.fn(),
  };

  const value: UseAuthShape = {
    ...defaultState,
    ...rest,
    state: resolveState(overrides),
  };
  useAuthMock.mockReturnValue(value);
  return value;
}

type SignInOverrides = Pick<
  MockAuthOverrides,
  'signIn' | 'loading' | 'state' | 'error' | 'clearError'
>;

export function mockAuthSignIn(overrides: SignInOverrides = {}): UseAuthShape {
  return mockAuthState({
    signIn:
      overrides.signIn ??
      vi
        .fn<(login: string, password: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    loading: overrides.loading ?? false,
    state: overrides.state,
    error: overrides.error ?? null,
    clearError: overrides.clearError ?? vi.fn(),
  });
}

type SignUpOverrides = Pick<
  MockAuthOverrides,
  'signUp' | 'loading' | 'state' | 'error' | 'clearError'
>;

export function mockAuthSignUp(overrides: SignUpOverrides = {}): UseAuthShape {
  return mockAuthState({
    signUp:
      overrides.signUp ??
      vi
        .fn<(u: string, e: string, p: string) => Promise<void>>()
        .mockResolvedValue(undefined),
    loading: overrides.loading ?? false,
    state: overrides.state,
    error: overrides.error ?? null,
    clearError: overrides.clearError ?? vi.fn(),
  });
}

export function resetUseAuthMock(): void {
  useAuthMock.mockReset();
}
