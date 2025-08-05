import SignUpForm from '../../forms/SignUpForm/SignUpForm';
import InlineLink from '../../InlineLink';
import AuthModal from '../AuthModal/AuthModal';

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
  return (
    <AuthModal
      variant="signup"
      isOpen={isOpen}
      onClose={onClose}
      onGoogle={onGoogle}
    >
      <SignUpForm />
      <InlineLink
        onClick={onSwitchToSignIn}
        className="mt-4 block text-center text-base"
      >
        Already have an account? Sign in
      </InlineLink>
    </AuthModal>
  );
}
export default SignUpModal;
