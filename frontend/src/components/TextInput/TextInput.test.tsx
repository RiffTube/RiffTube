import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TextInput, { TextInputProps } from './TextInput';

const defaultProps: Omit<TextInputProps, 'onChange'> = {
  id: 'email',
  label: 'Email',
  placeholder: 'you@example.com',
  type: 'text',
  value: '',
};

const makeUser = () => userEvent.setup();

describe('<TextInput />', () => {
  it('renders an accessible input with associated label', () => {
    const onChange = vi.fn();
    render(<TextInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();

    expect(input).toHaveAttribute('id', 'email');
  });

  it('supports the `type` prop', () => {
    const onChange = vi.fn();
    render(<TextInput {...defaultProps} type="password" onChange={onChange} />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows placeholder text', () => {
    const onChange = vi.fn();
    render(
      <TextInput
        {...defaultProps}
        placeholder="Enter your email"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
  });

  /* ---------- CHANGE EVENTS ---------- */

  it('calls `onChange` each time the user types', async () => {
    const onChange = vi.fn();
    render(<TextInput {...defaultProps} onChange={onChange} />);

    const user = makeUser();
    const input = screen.getByLabelText('Email');

    await user.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('shows infoMessage only while focused and no error', async () => {
    const onChange = vi.fn();
    render(
      <TextInput
        {...defaultProps}
        infoMessage="All good!"
        onChange={onChange}
      />,
    );

    const user = makeUser();
    const input = screen.getByLabelText('Email');

    await user.click(input);
    expect(screen.getByText('All good!')).toBeVisible();

    await user.tab(); // blur
    expect(screen.queryByText('All good!')).toBeNull();
  });

  it('adds required attribute and asterisk when `required`', () => {
    const onChange = vi.fn();
    render(<TextInput {...defaultProps} required onChange={onChange} />);

    const input = screen.getByLabelText(/Email/);
    expect(input).toBeRequired();
    expect(screen.getByText(/Email\s*\*/)).toBeInTheDocument();
  });

  it('does NOT show external error until the field is blurred', async () => {
    const onChange = vi.fn();
    render(
      <TextInput {...defaultProps} errorMessage="Oops" onChange={onChange} />,
    );

    const user = makeUser();
    const input = screen.getByLabelText('Email');

    expect(screen.queryByText('Oops')).toBeNull(); // before blur
    await user.click(input); // focus
    await user.tab(); // blur
    expect(screen.getByText('Oops')).toBeVisible();
  });

  it('shows external error immediately when forceShowError is true', () => {
    const onChange = vi.fn();
    render(
      <TextInput
        {...defaultProps}
        errorMessage="Server error"
        forceShowError
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Server error')).toBeVisible();
  });

  it('toggles aria-invalid & aria-describedby with error visibility', async () => {
    const onChange = vi.fn();
    render(
      <TextInput
        {...defaultProps}
        id="email"
        errorMessage="Bad"
        onChange={onChange}
      />,
    );

    const user = makeUser();
    const input = screen.getByLabelText('Email');

    expect(input).not.toHaveAttribute('aria-invalid', 'true');

    await user.click(input);
    await user.tab(); // blur

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('shows default “Invalid value” when pattern mismatch after blur', async () => {
    const onChange = vi.fn();
    render(
      <TextInput
        {...defaultProps}
        pattern="\d+" // digits only
        value="abc"
        onChange={onChange}
      />,
    );

    const user = makeUser();
    const input = screen.getByLabelText('Email');

    await user.click(input);
    await user.tab();

    expect(screen.getByText('Invalid value')).toBeVisible();
  });
});
