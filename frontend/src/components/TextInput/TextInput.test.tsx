import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TextInput, { Size, TextInputProps } from './TextInput';

const baseProps: Omit<TextInputProps, 'onChange'> = {
  id: 'email',
  label: 'Email',
  placeholder: 'you@example.com',
  type: 'text',
  value: '',
};

describe('<TextInput />', () => {
  it('renders an accessible input with label', () => {
    render(<TextInput {...baseProps} onChange={() => {}} />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'email');
  });

  it('supports the `type` prop', () => {
    render(<TextInput {...baseProps} type="password" onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'password');
  });

  it('shows placeholder text', () => {
    render(
      <TextInput
        {...baseProps}
        placeholder="Enter your email"
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'placeholder',
      'Enter your email',
    );
  });

  it.each<[Size, string]>([
    ['sm', 'text-sm'],
    ['md', 'text-base'],
    ['lg', 'text-lg'],
  ])('applies %s size classes', (size, cls) => {
    render(<TextInput {...baseProps} size={size} onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toHaveClass(cls);
  });

  it('calls onChange for each keystroke', async () => {
    const onChange = vi.fn();
    render(<TextInput {...baseProps} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Email'), 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('shows infoMessage while focused, hides on blur', async () => {
    render(
      <TextInput {...baseProps} infoMessage="All good!" onChange={() => {}} />,
    );
    const user = userEvent.setup();

    const input = screen.getByLabelText('Email');
    await user.click(input);
    expect(screen.getByText('All good!')).toBeVisible();

    await user.tab();
    expect(screen.queryByText('All good!')).toBeNull();
  });

  it('shows external error after blur', async () => {
    render(
      <TextInput {...baseProps} errorMessage="Oops" onChange={() => {}} />,
    );
    const user = userEvent.setup();
    const input = screen.getByLabelText('Email');

    await user.click(input);
    await user.tab();
    expect(screen.getByText('Oops')).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('forces error immediately with forceShowError', () => {
    render(
      <TextInput
        {...baseProps}
        errorMessage="Server error"
        forceShowError
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Server error')).toBeVisible();
  });

  it('is disabled when `disabled` prop is true', () => {
    render(<TextInput {...baseProps} disabled onChange={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('renders as readOnly (no border, cursor‑default)', () => {
    render(<TextInput {...baseProps} readOnly onChange={() => {}} />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveClass('cursor-default');
  });
});
