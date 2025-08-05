import { useState } from 'react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import TextInput from '@/components/TextInput';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/constants';
import { useAuth } from '@/features/auth/hooks/useAuth'; // ← NEW
import AuthModalLayout from '../../AuthModalLayout';
import InlineLink from '../../InlineLink';
import OAuthButton from '../../OAuthButton';

export interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onGoogle?: () => void;
}

function SignInModal({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onGoogle,
}: SignInModalProps) {
  const { signIn, loading: authLoading, error: authError } = useAuth(); // ← NEW
  const [localLoading, setLocalLoading] = useState(false);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // -------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setLocalLoading(true);
    try {
      await signIn(login.trim(), password);
      onClose();
    } catch {
      // Error is handled by useAuth hook
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
  const isFormInvalid = !login || !password || isPwdTooShort;

  const isBusy = localLoading || authLoading;

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

        {authError && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            id="signin-login"
            label="Email or username"
            value={login}
            onChange={e => setLogin(e.target.value)}
            placeholder="you@example.com or your username"
            required
          />

          <TextInput
            id="signin-password"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            pattern={`.{${PASSWORD_MIN_LENGTH},}`}
            errorMessage={`Password must be at least ${PASSWORD_MIN_LENGTH} characters`}
          />

          <div className="mb-4">
            <InlineLink href="/forgot">Trouble signing in?</InlineLink>
          </div>

          <Button
            disabled={isBusy || isFormInvalid}
            type="submit"
            className="w-full text-2xl"
            size="lg"
          >
            {isBusy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </AuthModalLayout>

      <div className="mt-4 mb-8 text-center">
        <InlineLink onClick={onSwitchToSignUp} className="text-base">
          Don&apos;t have an account? Sign up
        </InlineLink>
      </div>
    </Modal>
  );
}

export default SignInModal;
