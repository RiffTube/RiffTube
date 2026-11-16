import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { mockAuthSignUp } from '@/testUtils/mockUseAuth'; // adjust path if needed
import SignUpModal from './SignUpModal';

const signUpMock = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

mockAuthSignUp({
  signUp: signUpMock,
  loading: false,
  error: null,
});

const renderModal = (extraProps = {}) =>
  render(
    <SignUpModal
      isOpen
      onClose={vi.fn()}
      onSwitchToSignIn={vi.fn()}
      {...extraProps}
    />,
  );

describe('<SignUpModal />', () => {
  it('renders heading, OAuth button, inputs, copy, submit & switch link', () => {
    renderModal();

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
      screen.getByRole('button', { name: /^sign up$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/already have an account\? sign in/i),
    ).toBeInTheDocument();
  });

  // TODO: Blocked by figuring out how to submit the form inside the portal reliably.
  it.todo('enables submit only when all fields are valid, then calls signUp');

  it('fires onSwitchToSignIn when the footer link is clicked', async () => {
    const onSwitch = vi.fn();
    renderModal({ onSwitchToSignIn: onSwitch });

    await userEvent.click(
      screen.getByText(/already have an account\? sign in/i),
    );
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
