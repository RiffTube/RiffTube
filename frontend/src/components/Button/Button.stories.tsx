import type { Meta, StoryObj } from '@storybook/react';
import { Play } from 'lucide-react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
    },
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    disabled: false,
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  parameters: {
    controls: { exclude: ['variant'] },
  },
};

export const LightMode: Story = {
  args: { variant: 'lightMode' },
  parameters: {
    controls: { exclude: ['variant'] },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const IconOnly: Story = {
  args: {
    children: <Play className="h-5 w-5" />,
    ariaLabel: 'Play',
  },
};
