import { vi } from 'vitest';

export type UseAuthSigninShape = {
  signIn: (login: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

export type UseAuthSignupShape = {
  signUp: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

export const useAuthMock =
  vi.fn<() => UseAuthSigninShape | UseAuthSignupShape>();

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: useAuthMock,
}));

export function mockAuthSignIn(
  overrides: Partial<UseAuthSigninShape> = {},
): UseAuthSigninShape {
  const signIn =
    overrides.signIn ??
    vi
      .fn<(login: string, password: string) => Promise<void>>()
      .mockResolvedValue(undefined);

  const clearError = overrides.clearError ?? vi.fn<() => void>(() => undefined);

  const value: UseAuthSigninShape = {
    signIn,
    loading: overrides.loading ?? false,
    error: overrides.error ?? null,
    clearError,
  };

  useAuthMock.mockReturnValue(value);
  return value;
}

export function mockAuthSignUp(
  overrides: Partial<UseAuthSignupShape> = {},
): UseAuthSignupShape {
  const signUp =
    overrides.signUp ??
    vi
      .fn<(u: string, e: string, p: string) => Promise<void>>()
      .mockResolvedValue(undefined);

  const clearError = overrides.clearError ?? vi.fn<() => void>(() => undefined);

  const value: UseAuthSignupShape = {
    signUp,
    loading: overrides.loading ?? false,
    error: overrides.error ?? null,
    clearError,
  };

  useAuthMock.mockReturnValue(value);
  return value;
}

export function resetUseAuthMock(): void {
  useAuthMock.mockReset();
}
