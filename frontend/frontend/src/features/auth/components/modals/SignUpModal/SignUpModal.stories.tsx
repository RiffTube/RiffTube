import { useState } from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import SignUpModal, { SignUpModalProps } from './SignUpModal';

const meta: Meta<typeof SignUpModal> = {
  title: 'Auth/SignUpModal',
  component: SignUpModal,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.get('/api/v1/users/me', () =>
          HttpResponse.json({ error: 'Not logged in' }, { status: 401 }),
        ),

        http.post('/api/v1/signup', async () =>
          HttpResponse.json({
            user: {
              id: 'demo-user-id',
              username: 'new_user',
              email: 'new_user@example.com',
            },
          }),
        ),
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof SignUpModal>;

function StatefulWrapper(args: SignUpModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(args.isOpen ?? false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ marginBottom: 16, padding: '8px 12px' }}
      >
        Open Sign Up Modal
      </button>
      <SignUpModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToSignIn={args.onSwitchToSignIn ?? action('onSwitchToSignIn')}
        onGoogle={args.onGoogle ?? action('onGoogle')}
      />
    </>
  );
}

export const Default: Story = {
  render: args => <StatefulWrapper {...args} />,
  args: { isOpen: true },
};
