import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TextInput from './TextInput';

describe('<TextInput />', () => {
  it('associates the textbox with its label', () => {
    render(
      <TextInput
        id="email"
        label="Email"
        placeholder="you@example.com"
        type="text"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('textbox', { name: /Email/ });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
  });

  it('applies the sm size class', () => {
    render(
      <TextInput
        id="username"
        label="Username"
        size="sm"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox', { name: /Username/ })).toHaveClass(
      'text-sm',
    );
  });

  it('applies the md size class', () => {
    render(
      <TextInput
        id="username"
        label="Username"
        size="md"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox', { name: /Username/ })).toHaveClass(
      'text-base',
    );
  });

  it('applies the lg size class', () => {
    render(
      <TextInput
        id="username"
        label="Username"
        size="lg"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox', { name: /Username/ })).toHaveClass(
      'text-lg',
    );
  });

  it('shows placeholder text', () => {
    render(
      <TextInput
        id="email"
        label="Email"
        placeholder="Enter your email"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox', { name: /Email/ })).toHaveAttribute(
      'placeholder',
      'Enter your email',
    );
  });

  it('fires onChange for every keystroke', async () => {
    const handleChange = vi.fn();
    render(
      <TextInput
        id="email"
        label="Email"
        type="text"
        value=""
        onChange={handleChange}
      />,
    );
    const input = screen.getByRole('textbox', { name: /Email/ });
    await userEvent.type(input, 'abc');
    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it('shows infoMessage while focused and valid, then hides on blur', async () => {
    render(
      <TextInput
        id="nickname"
        label="Nickname"
        infoMessage="Looks good!"
        defaultValue="prefilled"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('textbox', { name: /Nickname/ });
    await userEvent.click(input);
    expect(screen.getByText('Looks good!')).toBeVisible();
    await userEvent.tab();
    expect(screen.queryByText('Looks good!')).toBeNull();
  });

  it('shows a required-field error only after blur', async () => {
    render(<TextInput id="email" label="Email" required onChange={() => {}} />);
    const input = screen.getByRole('textbox', { name: /Email/ });
    await userEvent.click(input); // focus
    await userEvent.tab(); // blur
    expect(screen.getByText(/Invalid value/i)).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the custom pattern error on mismatch and clears when valid', async () => {
    render(
      <TextInput
        id="digits"
        label="Digits"
        pattern="\d+"
        errorMessage="Digits only"
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('textbox', { name: /Digits/ });

    // invalid
    await userEvent.type(input, 'abc');
    await userEvent.tab();
    expect(screen.getByText('Digits only')).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');

    // valid
    await userEvent.clear(input);
    await userEvent.type(input, '123');
    await userEvent.tab();
    expect(screen.queryByText('Digits only')).toBeNull();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('is disabled when the disabled prop is set', () => {
    render(<TextInput id="email" label="Email" disabled onChange={() => {}} />);
    expect(screen.getByRole('textbox', { name: /Email/ })).toBeDisabled();
  });

  it('renders readOnly with cursor-default styling', () => {
    render(<TextInput id="email" label="Email" readOnly onChange={() => {}} />);
    const input = screen.getByRole('textbox', { name: /Email/ });
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveClass('cursor-default');
  });
});
