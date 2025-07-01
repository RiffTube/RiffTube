import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import TextInput, { TextInputProps } from './';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    onChange: { action: 'changed' },
    errorMessage: { control: 'text' },
    pattern: { control: 'text' },
    required: { control: 'boolean' },
  },
};
export default meta;

const Template: StoryFn<TextInputProps> = args => {
  const [val, setVal] = useState(args.value);

  return (
    <TextInput
      {...args}
      value={val}
      onChange={e => {
        setVal(e.target.value);
        args.onChange?.(e);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 'email',
  label: 'Email',
  value: '',
  placeholder: 'you@example.com',
  required: true,
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  errorMessage: 'Please enter a valid email address',
};
