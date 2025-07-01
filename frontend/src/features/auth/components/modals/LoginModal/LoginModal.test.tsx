import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoginModal from './LoginModal';

describe('LoginModal', () => {
  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();

    render(
      <LoginModal
        isOpen={false}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );
    expect(screen.queryByText(/Log in to RiffTube/i)).toBeNull();
  });

  it('renders title, inputs, links, and button when open', () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();

    render(
      <LoginModal
        isOpen={true}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /Log in to RiffTube/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or email/i)).toBeInTheDocument();
    const pwd = screen.getByLabelText(/Password/i);
    expect(pwd).toHaveAttribute('type', 'password');
    expect(screen.getByText(/Trouble logging in\?/i)).toHaveAttribute(
      'href',
      '/forgot',
    );
    expect(screen.getByRole('button', { name: /Log in/i })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('updates inputs when typing', async () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();

    render(
      <LoginModal
        isOpen={true}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );
    const userInput = screen.getByLabelText(
      /Username or email/i,
    ) as HTMLInputElement;
    const passInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    await userEvent.type(userInput, 'foo');
    await userEvent.type(passInput, 'bar');

    expect(userInput.value).toBe('foo');
    expect(passInput.value).toBe('bar');
  });

  it('calls console.log with credentials on submit', async () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <LoginModal
        isOpen={true}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );
    await userEvent.type(screen.getByLabelText(/Username or email/i), 'alice');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wonderland');
    await userEvent.click(screen.getByRole('button', { name: /Log in/i }));

    expect(logSpy).toHaveBeenCalledWith({
      username: 'alice',
      password: 'wonderland',
    });
    logSpy.mockRestore();
  });

  it('calls onSwitchToSignUp when you click the "Sign up" link', async () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();

    render(
      <LoginModal
        isOpen={true}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );

    const user = userEvent.setup();
    const signUpTrigger = screen.getByText(/Don't have an account\? Sign up/i);

    await user.click(signUpTrigger);
    expect(onSwitchToSignUp).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn();
    const onSwitchToSignUp = vi.fn();

    render(
      <LoginModal
        isOpen={true}
        onClose={onClose}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
