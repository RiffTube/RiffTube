import React, { useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import AuthModalLayout from '../../AuthModalLayout';
import InlineLink from '../../InlineLink';
import OAuthButton from '../../OAuthButton';

export interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  /** Optional: trigger Google OAuth */
  onGoogle?: () => void;
  onSignUp: (data: { email: string; password: string }) => Promise<void>;
}

function SignUpModal({
  isOpen,
  onClose,
  onSwitchToSignIn,
  onGoogle,
  onSignUp,
}: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up signup logic
    await onSignUp({ email, password });
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
      <AuthModalLayout title="Join RiffTube Today">
        <div className="mb-4">
          <OAuthButton mode="signup" onClick={handleGoogle} provider="google">
            Sign up with Google
          </OAuthButton>
        </div>
        <form onSubmit={handleSubmit} className="">
          <TextInput
            id="signup-email"
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <TextInput
            id="signup-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <p className="mt-4 mb-6 text-sm">
            By clicking Sign Up, you are agreeing to RiffTube's{' '}
            <InlineLink href="/terms">Terms of Service</InlineLink> and are
            acknowledging our{' '}
            <InlineLink href="/guidelines">Community Guidelines</InlineLink>{' '}
            apply.
          </p>

          <Button type="submit" className="w-full text-2xl" size="lg">
            Sign up
          </Button>
        </form>
      </AuthModalLayout>
      <div className="mt-4 mb-8 text-center">
        <InlineLink onClick={onSwitchToSignIn}>
          Already have an account? Sign in
        </InlineLink>
      </div>
    </Modal>
  );
}

export default SignUpModal;
