import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/constants';
import { mockAuthSignUp } from '@/testUtils/mockUseAuth';
import SignUpForm from './SignUpForm';

describe('<SignUpForm />', () => {
  it('renders inputs and a disabled submit button initially', () => {
    mockAuthSignUp();
    render(<SignUpForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const submit = screen.getByRole('button', { name: /^sign up$/i });
    expect(submit).toBeDisabled();
  });

  it('enables submit when fields are valid and calls signUp, then onSuccess', async () => {
    const user = userEvent.setup();
    const { signUp } = mockAuthSignUp();
    const onSuccess = vi.fn();

    render(<SignUpForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'alice_01');
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(
      screen.getByLabelText(/password/i),
      'x'.repeat(PASSWORD_MIN_LENGTH),
    );

    const submit = screen.getByRole('button', { name: /^sign up$/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    await waitFor(() => expect(signUp).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('trims whitespace from username and email before submit', async () => {
    const user = userEvent.setup();
    const { signUp } = mockAuthSignUp();

    const { container } = render(<SignUpForm />);
    const form = container.querySelector('form')!;

    await user.type(screen.getByLabelText(/username/i), '  alice_01  ');
    await user.type(screen.getByLabelText(/email/i), '  alice@example.com  ');
    await user.type(
      screen.getByLabelText(/password/i),
      'x'.repeat(PASSWORD_MIN_LENGTH),
    );

    fireEvent.submit(form);

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith(
        'alice_01',
        'alice@example.com',
        'x'.repeat(PASSWORD_MIN_LENGTH),
      ),
    );
  });

  it('shows backend error and clears on typing', async () => {
    const user = userEvent.setup();
    const { clearError } = mockAuthSignUp({ error: 'Email already taken' });

    render(<SignUpForm />);

    expect(screen.getByRole('alert')).toHaveTextContent(/email already taken/i);

    await user.type(screen.getByLabelText(/username/i), 'a');
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('keeps submit disabled while loading and shows spinner text', () => {
    mockAuthSignUp({ loading: true });
    render(<SignUpForm />);

    expect(screen.getByRole('button', { name: /signing up…/i })).toBeDisabled();
  });

  it('keeps submit disabled for invalid inputs', async () => {
    const user = userEvent.setup();
    mockAuthSignUp();

    render(<SignUpForm />);

    await user.type(screen.getByLabelText(/username/i), 'bad space');
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/password/i), 'short');

    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeDisabled();
  });
});
