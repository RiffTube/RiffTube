import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SignUpModal from './SignUpModal';

describe('SignUpModal', () => {
  it('renders title, OAuth button, inputs, agreement, submit, and switch link', () => {
    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={() => {}}
        onSignUp={async () => {}}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /join rifftube today/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /sign up with google/i }),
    ).toBeInTheDocument();

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

  it('calls onGoogle when the OAuth button is clicked', () => {
    const onGoogle = vi.fn();

    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={onGoogle}
        onSignUp={async () => {}}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /sign up with google/i }),
    );
    expect(onGoogle).toHaveBeenCalledTimes(1);
  });

  it('calls onSignUp with email & password on submit', async () => {
    const user = userEvent.setup();
    const onSignUp = vi.fn().mockResolvedValue(undefined);

    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={() => {}}
        onGoogle={() => {}}
        onSignUp={onSignUp}
      />,
    );

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'hunter2');
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));

    expect(onSignUp).toHaveBeenCalledTimes(1);
    expect(onSignUp).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'hunter2',
    });
  });

  it('calls onSwitchToSignIn when clicking the switch link', () => {
    const onSwitch = vi.fn();

    render(
      <SignUpModal
        isOpen
        onClose={() => {}}
        onSwitchToSignIn={onSwitch}
        onGoogle={() => {}}
        onSignUp={async () => {}}
      />,
    );

    fireEvent.click(screen.getByText(/already have an account\? sign in/i));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
