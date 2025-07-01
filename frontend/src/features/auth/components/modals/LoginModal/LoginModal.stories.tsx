import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import LoginModal, { LoginModalProps } from './LoginModal';

export default {
  title: 'Auth/LoginModal',
  component: LoginModal,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof LoginModal>;

const Template: StoryFn<typeof LoginModal> = (args: LoginModalProps) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  return (
    <>
      <button onClick={() => setIsOpen(true)} style={{ marginBottom: 16 }}>
        Open Login Modal
      </button>
      <LoginModal
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
