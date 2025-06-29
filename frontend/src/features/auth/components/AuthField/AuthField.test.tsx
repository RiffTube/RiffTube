import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AuthField from './AuthField';

const baseProps = {
  id: 'username',
  label: 'Username',
  placeholder: 'john@example.com',
  type: 'text' as const,
};

const createUser = () => userEvent.setup();

describe('<AuthField />', () => {
  it('forwards basic props (value, placeholder, type) to the underlying input', () => {
    const onChange = vi.fn();
    render(<AuthField {...baseProps} value="abc" onChange={onChange} />);

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveValue('abc');
    expect(input).toHaveAttribute('placeholder', 'john@example.com');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('forwards validation props (`required`, `pattern`)', () => {
    render(<AuthField {...baseProps} required pattern="\d+" />);

    const input = screen.getByLabelText(/username/i);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('pattern', '\\d+');
  });

  it('behaves in uncontrolled mode (uses `defaultValue` when `value` is absent)', async () => {
    const onChange = vi.fn();
    const user = createUser();
    render(<AuthField {...baseProps} defaultValue="x" onChange={onChange} />);

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveValue('x');

    await user.clear(input);
    await user.type(input, 'new');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('new');
  });

  it('shows the `error.message` only after blur', async () => {
    const error = { type: 'manual', message: 'Required' };
    const user = createUser();
    render(<AuthField {...baseProps} error={error} />);

    const input = screen.getByLabelText(/username/i);
    expect(screen.queryByText('Required')).toBeNull(); // before interaction

    await user.click(input); // focus
    await user.tab(); // blur

    expect(await screen.findByText('Required')).toBeVisible();
  });

  it('renders no error when `error` prop is undefined', () => {
    render(<AuthField {...baseProps} />);
    expect(screen.queryByText(/Required|My error/i)).toBeNull();
  });

  it('invokes `onChange` when the user types', async () => {
    const onChange = vi.fn();
    const user = createUser();
    render(<AuthField {...baseProps} value="" onChange={onChange} />);

    const input = screen.getByLabelText(/username/i);
    await user.type(input, 'abc');
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
