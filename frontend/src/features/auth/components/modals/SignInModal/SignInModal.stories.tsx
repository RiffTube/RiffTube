import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import SignInModal, { SignInModalProps } from './SignInModal';

export default {
  title: 'Auth/SignInModal',
  component: SignInModal,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof SignInModal>;

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
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
};
