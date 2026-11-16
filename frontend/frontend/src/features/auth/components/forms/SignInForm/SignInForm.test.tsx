import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { mockAuthSignIn } from '@/testUtils/mockUseAuth'; // adjust path if needed
import SignInForm from './SignInForm';

describe('<SignInForm />', () => {
  it('renders inputs and an initially disabled submit button', () => {
    mockAuthSignIn();
    render(<SignInForm />);

    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: /^sign in$/i });
    expect(submit).toBeDisabled();
  });

  it('enables submit when fields are valid and calls signIn with trimmed values, then onSuccess', async () => {
    const user = userEvent.setup();
    const signIn = vi
      .fn<(login: string, password: string) => Promise<void>>()
      .mockResolvedValue(undefined);

    mockAuthSignIn({ signIn });

    const onSuccess = vi.fn();
    render(<SignInForm onSuccess={onSuccess} />);

    const loginInput = screen.getByLabelText(/email or username/i);
    const pwdInput = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(loginInput, '  alice  ');
    await user.type(pwdInput, '  secret  ');
    expect(submit).toBeEnabled();

    await user.click(submit);

    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(signIn).toHaveBeenCalledWith('alice', 'secret');
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows backend error from useAuth and clears it when the user types', async () => {
    const user = userEvent.setup();
    const clearError = vi.fn<() => void>(() => undefined);

    mockAuthSignIn({ error: 'Invalid email or password', clearError });

    render(<SignInForm />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/invalid email or password/i);

    await user.type(screen.getByLabelText(/email or username/i), 'a');
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('keeps submit disabled and shows spinner text while loading', () => {
    mockAuthSignIn({ loading: true });
    render(<SignInForm />);

    const btn = screen.getByRole('button', { name: /signing in…/i });
    expect(btn).toBeDisabled();
  });

  it('does not submit when a field is empty', async () => {
    const user = userEvent.setup();
    const signIn = vi
      .fn<(login: string, password: string) => Promise<void>>()
      .mockResolvedValue(undefined);

    mockAuthSignIn({ signIn });

    render(<SignInForm />);

    await user.type(screen.getByLabelText(/email or username/i), 'alice');
    const btn = screen.getByRole('button', { name: /^sign in$/i });
    expect(btn).toBeDisabled();

    expect(signIn).not.toHaveBeenCalled();
  });
});
