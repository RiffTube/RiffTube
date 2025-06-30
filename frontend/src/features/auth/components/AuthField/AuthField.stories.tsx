import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FieldError } from 'react-hook-form';
import AuthField from './AuthField';

const meta: Meta<typeof AuthField> = {
  title: 'Auth/AuthField',
  component: AuthField,
  argTypes: {
    value: { table: { disable: true } },
    onChange: { table: { disable: true } },
    error: { table: { disable: true } },
    id: { control: 'text' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    type: { control: 'text' },
    required: { control: 'boolean' },
    pattern: { control: 'text' },
  },
  parameters: { controls: { expanded: true } },
};

export default meta;
type Story = StoryObj<typeof AuthField>;

const withLocalValidation: Story['render'] = initialArgs => {
  const [value, setValue] = useState(initialArgs.value ?? '');
  const [error, setError] = useState<FieldError | undefined>(initialArgs.error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setValue(nextValue);
    if (!e.target.validity.valid) {
      setError(
        initialArgs.error ??
          ({ type: 'manual', message: 'Invalid value' } as FieldError),
      );
    } else {
      setError(undefined);
    }
  };

  return (
    <AuthField
      {...initialArgs}
      value={value}
      onChange={handleChange}
      error={error}
    />
  );
};

export const Default: Story = {
  args: {
    id: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
    required: false,
  },
  render: withLocalValidation,
};

export const Required: Story = {
  args: {
    id: 'username',
    label: 'Username',
    placeholder: 'john_doe',
    type: 'text',
    required: true,
  },
  render: withLocalValidation,
};

export const WithError: Story = {
  args: {
    id: 'password',
    label: 'Password',
    placeholder: '••••••••',
    type: 'password',
    required: true,
    pattern: '.{8,}',
    error: {
      type: 'manual',
      message: 'Password must be at least 8 characters',
    },
  },
  render: withLocalValidation,
};
