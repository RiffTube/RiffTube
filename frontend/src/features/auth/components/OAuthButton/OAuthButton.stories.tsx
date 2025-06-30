import type { Meta, StoryObj } from '@storybook/react';
import OAuthButton from './OAuthButton';

const meta: Meta<typeof OAuthButton> = {
  title: 'Auth/OAuthButton',
  component: OAuthButton,
  argTypes: {
    onClick: { action: 'clicked' },
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A full-width, pill-shaped button for signing in with Google.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OAuthButton>;

export const Default: Story = {
  args: {
    onClick: () => alert('Google OAuth clicked!'),
  },
};
