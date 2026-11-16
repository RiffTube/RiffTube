import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { mockAuthSignIn } from '@/testUtils/mockUseAuth';
import SignInModal from './SignInModal';

describe('<SignInModal />', () => {
  it('does not render anything when isOpen is false', () => {
    mockAuthSignIn();
    render(
      <SignInModal
        isOpen={false}
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText(/sign in to rifftube/i)).toBeNull();
  });

  it('renders heading, OAuth button, inputs, submit and footer switch link', () => {
    mockAuthSignIn();
    render(<SignInModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /sign in to rifftube/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    const pwd = screen.getByLabelText(/password/i);
    expect(pwd).toBeInTheDocument();
    expect(pwd).toHaveAttribute('type', 'password');

    expect(
      screen.getByRole('button', { name: /^sign in$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/don.?t have an account\? sign up/i),
    ).toBeInTheDocument();
  });

  // TODO: Blocked by figuring out how to submit the form inside the portal reliably.
  it.todo('submits when valid and calls signIn and onClose');

  it('shows an error banner when useAuth returns an error (handles multiple alerts)', () => {
    mockAuthSignIn({ error: 'Invalid credentials' });

    render(<SignInModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(
      alerts.some(a => /invalid credentials/i.test(a.textContent ?? '')),
    ).toBe(true);
  });

  it('disables submit and shows spinner text while loading', () => {
    mockAuthSignIn({ loading: true });

    render(<SignInModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

    const btn = screen.getByRole('button', { name: /signing in…/i });
    expect(btn).toBeDisabled();
  });

  it('calls onSwitchToSignUp when the footer link is clicked', async () => {
    mockAuthSignIn();
    const onSwitch = vi.fn();

    render(
      <SignInModal isOpen onClose={vi.fn()} onSwitchToSignUp={onSwitch} />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/don.?t have an account\? sign up/i));

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
