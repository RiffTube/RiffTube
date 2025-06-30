import type { Meta, StoryObj } from '@storybook/react';
import { Play } from 'lucide-react';
import CTAButton from './CTAButton';

const meta: Meta<typeof CTAButton> = {
  title: 'Components/CTAButton',
  component: CTAButton,
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary', 'danger'],
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
type Story = StoryObj<typeof CTAButton>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const LightMode: Story = {
  args: { variant: 'lightMode' },
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
