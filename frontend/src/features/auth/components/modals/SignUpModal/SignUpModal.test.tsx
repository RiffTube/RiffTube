import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SignUpModal from './SignUpModal';

let signUpMock: ReturnType<typeof vi.fn>;

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    // will be reassigned inside each test
    signUp: signUpMock,
  }),
}));

describe('<SignUpModal />', () => {
  it('renders heading, OAuth button, inputs, agreement text, submit and switch link', () => {
    signUpMock = vi.fn();
    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={() => {}}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /join rifftube today/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /sign up with google/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.getByText(/by clicking sign up/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /community guidelines/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /^sign up$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/already have an account\? sign in/i),
    ).toBeInTheDocument();
  });

  it('calls onGoogle when the OAuth button is clicked', async () => {
    signUpMock = vi.fn();
    const onGoogle = vi.fn();

    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={onGoogle}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /sign up with google/i }),
    );
    expect(onGoogle).toHaveBeenCalledTimes(1);
  });

  it('enables submit only when all fields are valid and then calls signUp', async () => {
    signUpMock = vi.fn().mockResolvedValue(undefined);

    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={() => {}}
      />,
    );

    const user = userEvent.setup();

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign up$/i });

    expect(submitBtn).toBeDisabled();

    await user.type(usernameInput, 'alice_123');
    await user.type(emailInput, 'alice@example.com');
    await user.type(passwordInput, 'hunter2');

    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(signUpMock).toHaveBeenCalledTimes(1);
    expect(signUpMock).toHaveBeenCalledWith(
      'alice_123',
      'alice@example.com',
      'hunter2',
    );
  });

  it('fires onSwitchToSignIn when the switch link is clicked', async () => {
    signUpMock = vi.fn();
    const onSwitch = vi.fn();
    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={onSwitch}
        onGoogle={() => {}}
      />,
    );

    await userEvent.click(
      screen.getByText(/already have an account\? sign in/i),
    );
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
