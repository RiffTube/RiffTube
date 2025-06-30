import React, { useState } from 'react';
import CTAButton from '@/components/CTAButton';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import AuthModalLayout from '../../AuthModalLayout';
import InlineLink from '../../InlineLink';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up login logic
    console.log({ username, password });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <AuthModalLayout title="Log in to RiffTube">
        <form onSubmit={handleSubmit} className="">
          <TextInput
            id="login-username"
            label="Username or email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username or email"
          />
          <TextInput
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <div className="mb-4">
            <InlineLink href="/forgot">Trouble logging in?</InlineLink>
          </div>
          <CTAButton type="submit" className="w-full">
            Log in
          </CTAButton>
        </form>
      </AuthModalLayout>
      <div className="mt-4 text-center">
        <InlineLink onClick={onSwitchToSignUp} className="text-base">
          Don't have an account? Sign up
        </InlineLink>
      </div>
    </Modal>
  );
}

export default LoginModal;
