import React, { useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import AuthModalLayout from '../../AuthModalLayout';
import InlineLink from '../../InlineLink';
import OAuthButton from '../../OAuthButton';

export interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  /** Optional: trigger Google OAuth */
  onGoogle?: () => void;
  onSignIn: (data: { username: string; password: string }) => Promise<void>;
}

function SignInModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onGoogle,
  onSignIn,
}: SignInModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up signup logic
    await onSignIn({ username, password });
  };

  const handleGoogle = () => {
    if (onGoogle) return onGoogle();
    // Fallback: navigate to your backend OAuth entrypoint
    // window.location.href = '/api/v1/auth/google';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="mx-auto w-full max-w-[480px]"
    >
      <AuthModalLayout title="Sign in to RiffTube">
        <div className="mb-4">
          <OAuthButton mode="signin" onClick={handleGoogle} provider="google" />
        </div>
        <form onSubmit={handleSubmit} className="">
          <TextInput
            id="signin-username"
            label="Username or email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username or email"
          />
          <TextInput
            id="signin-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <div className="mb-4">
            <InlineLink href="/forgot">Trouble signing in?</InlineLink>
          </div>
          <Button type="submit" className="w-full text-2xl" size="lg">
            Sign in
          </Button>
        </form>
      </AuthModalLayout>
      <div className="mt-4 mb-8 text-center">
        <InlineLink onClick={onSwitchToSignUp} className="text-base">
          Don't have an account? Sign up
        </InlineLink>
      </div>
    </Modal>
  );
}

export default SignInModal;
