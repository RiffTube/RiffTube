import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SignInModal from './SignInModal';

// ---------- mock useAuth so we can inject spies ----------
let signInMock: ReturnType<typeof vi.fn>;

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    // will be reassigned inside each test
    signIn: signInMock,
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('<SignInModal />', () => {
  it('renders nothing when isOpen is false', () => {
    signInMock = vi.fn();
    render(
      <SignInModal
        isOpen={false}
        onClose={() => {}}
        onSwitchToSignUp={() => {}}
      />,
    );
    expect(screen.queryByText(/sign in to rifftube/i)).toBeNull();
  });

  it('shows heading, inputs, links, and submit when open', () => {
    signInMock = vi.fn();
    render(
      <SignInModal isOpen onClose={() => {}} onSwitchToSignUp={() => {}} />,
    );

    expect(
      screen.getByRole('heading', { name: /sign in to rifftube/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    const pwd = screen.getByLabelText(/password/i);
    expect(pwd).toHaveAttribute('type', 'password');

    expect(
      screen.getByRole('link', { name: /trouble signing in\?/i }),
    ).toHaveAttribute('href', '/forgot');

    expect(screen.getByRole('button', { name: /^sign in$/i })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('updates inputs as the user types', async () => {
    signInMock = vi.fn();
    render(
      <SignInModal isOpen onClose={() => {}} onSwitchToSignUp={() => {}} />,
    );

    const user = userEvent.setup();
    const idInput = screen.getByLabelText(
      /email or username/i,
    ) as HTMLInputElement;
    const passInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    await user.type(idInput, 'foo');
    await user.type(passInput, 'bar');

    expect(idInput).toHaveValue('foo');
    expect(passInput).toHaveValue('bar');
  });

  it('disables submit until form is valid, then calls signIn', async () => {
    signInMock = vi.fn().mockResolvedValue(undefined);

    render(
      <SignInModal isOpen onClose={() => {}} onSwitchToSignUp={() => {}} />,
    );

    const user = userEvent.setup();
    const idInput = screen.getByLabelText(/email or username/i);
    const pwdInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /^sign in$/i });

    expect(submitBtn).toBeDisabled();

    await user.type(idInput, 'alice');
    await user.type(pwdInput, 'wonderland');

    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith('alice', 'wonderland');
  });

  it('fires onSwitchToSignUp when the switch link is clicked', async () => {
    signInMock = vi.fn();
    const onSwitch = vi.fn();

    render(
      <SignInModal isOpen onClose={() => {}} onSwitchToSignUp={onSwitch} />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/don't have an account\? sign up/i));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it('fires onClose when Escape is pressed', async () => {
    signInMock = vi.fn();
    const onClose = vi.fn();

    render(
      <SignInModal isOpen onClose={onClose} onSwitchToSignUp={() => {}} />,
    );

    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
