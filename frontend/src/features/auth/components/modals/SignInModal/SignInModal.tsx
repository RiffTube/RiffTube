import SignInForm from '../../forms/SignInForm/SignInForm';
import InlineLink from '../../InlineLink';
import AuthModal from '../AuthModal/AuthModal';

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
  return (
    <AuthModal
      variant="signin"
      isOpen={isOpen}
      onClose={onClose}
      onGoogle={onGoogle}
    >
      <SignInForm />
      <InlineLink
        onClick={onSwitchToSignUp}
        className="mt-4 block text-center text-base"
      >
        Don&rsquo;t have an account? Sign up
      </InlineLink>
    </AuthModal>
  );
}
export default SignInModal;
