import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import LoginModal from './LoginModal';

describe('LoginModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <LoginModal
        isOpen={false}
        onClose={vi.fn()}
        onSwitchToSignUp={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Log in to RiffTube/i)).toBeNull();
  });

  it('renders title, inputs, links, and button when open', async () => {
    render(<LoginModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

    expect(
      await screen.findByRole('heading', { name: /Log in to RiffTube/i }),
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
    render(<LoginModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

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

  it('calls console.log with credentials on submit', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<LoginModal isOpen onClose={vi.fn()} onSwitchToSignUp={vi.fn()} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Username or email/i), 'alice');
    await user.type(screen.getByLabelText(/Password/i), 'wonderland');
    await user.click(screen.getByRole('button', { name: /Log in/i }));

    expect(logSpy).toHaveBeenCalledWith({
      username: 'alice',
      password: 'wonderland',
    });
    logSpy.mockRestore();
  });

  it('calls onSwitchToSignUp when clicking “Sign up” link', async () => {
    const onSwitchToSignUp = vi.fn();
    render(
      <LoginModal
        isOpen
        onClose={vi.fn()}
        onSwitchToSignUp={onSwitchToSignUp}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText(/Don't have an account\? Sign up/i));

    expect(onSwitchToSignUp).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', async () => {
    const onClose = vi.fn();
    render(<LoginModal isOpen onClose={onClose} onSwitchToSignUp={vi.fn()} />);

    const user = userEvent.setup();
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
