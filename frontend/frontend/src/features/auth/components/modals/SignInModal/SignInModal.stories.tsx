import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import SignInModal, { SignInModalProps } from './SignInModal';

const meta: Meta<typeof SignInModal> = {
  title: 'Auth/SignInModal',
  component: SignInModal,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        http.get('/api/v1/users/me', () =>
          HttpResponse.json({ error: 'Not logged in' }, { status: 401 }),
        ),

        http.post('/api/v1/login', async () =>
          HttpResponse.json(
            {
              user: {
                id: 'demo-user-id',
                username: 'existing_user',
                email: 'existing_user@example.com',
              },
            },
            { status: 200 },
          ),
        ),
      ],
    },
  },
};
export default meta;

const Template: StoryFn<typeof SignInModal> = (args: SignInModalProps) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ marginBottom: 16 }}>
        Open Sign In Modal
      </button>
      <SignInModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToSignUp={() => alert('Switch to Sign Up')}
        onGoogle={() => alert('Continue with Google')}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};
