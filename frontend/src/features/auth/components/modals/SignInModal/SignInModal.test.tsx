import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SignInModal from './';

describe('SignInModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <SignInModal
        isOpen={false}
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
        onSignIn={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.queryByText(/Sign in to RiffTube/i)).toBeNull();
  });

  it('renders title, inputs, links, and button when open', async () => {
    render(
      <SignInModal
        isOpen
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
        onSignIn={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    // heading
    expect(
      await screen.findByRole('heading', { name: /Sign in to RiffTube/i }),
    ).toBeInTheDocument();

    // inputs
    expect(screen.getByLabelText(/Username or email/i)).toBeInTheDocument();
    const pwd = screen.getByLabelText(/Password/i);
    expect(pwd).toHaveAttribute('type', 'password');

    // forgot link
    expect(screen.getByText(/Trouble signing in\?/i)).toHaveAttribute(
      'href',
      '/forgot',
    );

    // submit button
    expect(screen.getByRole('button', { name: /^sign in$/i })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('updates inputs when typing', async () => {
    render(
      <SignInModal
        isOpen
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
        onSignIn={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = userEvent.setup();
    const userInput = screen.getByLabelText(
      /Username or email/i,
    ) as HTMLInputElement;
    const passInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    await user.type(userInput, 'foo');
    await user.type(passInput, 'bar');

    expect(userInput.value).toBe('foo');
    expect(passInput.value).toBe('bar');
  });

  it('calls onSignIn with credentials on submit', async () => {
    const onSignIn = vi.fn().mockResolvedValue(undefined);
    render(
      <SignInModal
        isOpen
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
        onSignIn={onSignIn}
      />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Username or email/i), 'alice');
    await user.type(screen.getByLabelText(/Password/i), 'wonderland');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(onSignIn).toHaveBeenCalledWith({
      username: 'alice',
      password: 'wonderland',
    });
  });

  it('calls onSwitchToSignUp when clicking “Sign up” link', async () => {
    const onSwitch = vi.fn();
    render(
      <SignInModal
        isOpen
        onClose={vi.fn()}
        onSwitchToSignUp={onSwitch}
        onSignIn={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/Don't have an account\? Sign up/i));

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', async () => {
    const onClose = vi.fn();
    render(
      <SignInModal
        isOpen
        onClose={onClose}
        onSwitchToSignUp={vi.fn()}
        onSignIn={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = userEvent.setup();
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
