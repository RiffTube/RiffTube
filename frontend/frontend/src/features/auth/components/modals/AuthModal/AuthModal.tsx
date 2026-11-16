import { ReactNode } from 'react';
import Modal from '@/components/Modal';
import OAuthButton from '../../OAuthButton';
import AuthModalLayout from '../AuthModalLayout';

export interface AuthModalProps {
  variant: 'signin' | 'signup';
  isOpen: boolean;
  onClose: () => void;
  onGoogle?: () => void;
  error?: string | null;
  children: ReactNode;
  className?: string;
  busy?: boolean;
}

function AuthModal({
  variant,
  isOpen,
  onClose,
  onGoogle,
  error = null,
  children,
  className = '',
  busy = false,
}: AuthModalProps) {
  /* ----- strings that change between signin / signup ----- */
  const isSignUp = variant === 'signup';
  const header = isSignUp ? 'Join RiffTube Today' : 'Sign in to RiffTube';
  const oAuthTxt = isSignUp ? 'Sign up with Google' : 'Sign in with Google';

  /* ------------------------------------------------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`mx-auto w-full max-w-[480px] ${className}`}
    >
      <AuthModalLayout title={header}>
        <div className="mt-4">
          <OAuthButton
            mode={variant}
            provider="google"
            onClick={onGoogle}
            disabled={busy}
          >
            {oAuthTxt}
          </OAuthButton>
        </div>
        {error && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {children}
      </AuthModalLayout>
    </Modal>
  );
}
export default AuthModal;
