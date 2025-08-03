import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import SignUpModal, { SignUpModalProps } from './SignUpModal';

export default {
  title: 'Auth/SignUpModal',
  component: SignUpModal,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof SignUpModal>;

const Template: StoryFn<typeof SignUpModal> = (args: SignUpModalProps) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ marginBottom: 16 }}>
        Open Sign Up Modal
      </button>
      <SignUpModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSwitchToSignIn={() => alert('Switch to Sign In')}
        onGoogle={() => alert('Continue with Google')}
        onSignUp={async ({ email, password }) => {
          // Fake network call
          await new Promise(r => setTimeout(r, 800));
          console.log('SignUp payload', { email, password });
          setIsOpen(false);
        }}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};
