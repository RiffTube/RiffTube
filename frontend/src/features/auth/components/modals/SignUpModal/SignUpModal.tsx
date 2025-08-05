import { useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/constants';
import { useAuth } from '@/features/auth/hooks/useAuth'; // ← NEW
import AuthModalLayout from '../../AuthModalLayout';
import InlineLink from '../../InlineLink';
import OAuthButton from '../../OAuthButton';

export interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onGoogle?: () => void;
}

function SignUpModal({
  isOpen,
  onClose,
  onSwitchToSignIn,
  onGoogle,
}: SignUpModalProps) {
  const { signUp, loading: authLoading, error: authError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // -------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setLocalLoading(true);
    try {
      await signUp(username.trim(), email.trim(), password);
      onClose(); // close only on success
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogle = () => {
    if (onGoogle) return onGoogle();
  };

  // -------------------------------------------------------------------
  // Validation helpers
  // -------------------------------------------------------------------
  const isPwdTooShort =
    password.length > 0 && password.length < PASSWORD_MIN_LENGTH;
  const isFormInvalid = !username || !email || !password || isPwdTooShort;

  const isBusy = localLoading || authLoading;

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

        {authError && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <TextInput
            id="signup-username"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
            pattern="^[a-zA-Z0-9_]+$"
            infoMessage="This is the name other riffers will see on RiffTube. You can change it anytime."
            errorMessage="Letters, numbers, and underscores only"
          />

          {/* Email */}
          <TextInput
            id="signup-email"
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            pattern="\S+@\S+\.\S+"
            errorMessage="Invalid email address"
          />

          {/* Password */}
          <TextInput
            id="signup-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            pattern={`.{${PASSWORD_MIN_LENGTH},}`}
            errorMessage={`Password must be at least ${PASSWORD_MIN_LENGTH} characters`}
          />

          <p className="mt-4 mb-6 text-sm">
            By clicking Sign Up, you agree to RiffTube’s{' '}
            <InlineLink href="/terms">Terms of Service</InlineLink> and{' '}
            acknowledge our{' '}
            <InlineLink href="/guidelines">Community Guidelines</InlineLink>.
          </p>

          <Button
            disabled={isBusy || isFormInvalid}
            type="submit"
            className="w-full text-2xl"
            size="lg"
          >
            {isBusy ? 'Signing up…' : 'Sign up'}
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
