// AuthField.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AuthField from './AuthField';

describe('<AuthField />', () => {
  it('forwards basic props (value, placeholder, type) to the underlying input', () => {
    const onChange = vi.fn();
    render(
      <AuthField
        id="username"
        label="Username"
        placeholder="john@example.com"
        type="text"
        value="abc"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /username/i });
    expect(input).toHaveValue('abc');
    expect(input).toHaveAttribute('placeholder', 'john@example.com');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('forwards validation props (`required`, `pattern`)', () => {
    render(
      <AuthField
        id="code"
        label="Code"
        placeholder="12345"
        type="text"
        required
        pattern="\d+"
      />,
    );

    const input = screen.getByRole('textbox', { name: /code/i });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('pattern', '\\d+');
  });

  it('behaves in uncontrolled mode (uses `defaultValue` when `value` is absent)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AuthField
        id="nickname"
        label="Nickname"
        placeholder="Pick one"
        type="text"
        defaultValue="x"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /nickname/i });
    expect(input).toHaveValue('x');

    await user.clear(input);
    await user.type(input, 'new');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('new');
  });

  it('shows the native “required” error only after blur', async () => {
    const user = userEvent.setup();
    render(
      <AuthField
        id="email"
        label="Email"
        placeholder="you@example.com"
        type="text"
        required
      />,
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(screen.queryByText(/invalid value/i)).toBeNull();

    await user.click(input); // focus
    expect(screen.queryByText(/invalid value/i)).toBeNull();

    await user.tab(); // blur
    expect(screen.getByText(/invalid value/i)).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('invokes `onChange` when the user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <AuthField
        id="username"
        label="Username"
        placeholder="john@example.com"
        type="text"
        value=""
        onChange={onChange}
      />,
    );

    const input = screen.getByRole('textbox', { name: /username/i });
    await user.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
