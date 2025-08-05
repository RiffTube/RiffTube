import { useState } from 'react';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import InlineLink from '../../InlineLink';

export interface SignUpFormProps {
  onSuccess?: () => void;

  className?: string;
}

export default function SignUpForm({
  onSuccess,
  className = '',
}: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const usernameTrim = username.trim();
  const emailTrim = email.trim();

  const usernameValid =
    usernameTrim.length > 0 && /^[a-zA-Z0-9_]+$/.test(usernameTrim);
  const emailValid = emailTrim.length > 0 && /\S+@\S+\.\S+/.test(emailTrim);
  const pwdValid = password.length >= PASSWORD_MIN_LENGTH;

  const isFormInvalid = !(usernameValid && emailValid && pwdValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid || loading) return;

    try {
      await signUp(usernameTrim, emailTrim, password);
      onSuccess?.();
    } catch {
      // Error string is set by useAuth; we just leave it visible.
    }
  };

  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setUsername(e.target.value);
  };

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setEmail(e.target.value);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mt-6">
        <TextInput
          id="signup-username"
          label="Username"
          value={username}
          onChange={onUsernameChange}
          placeholder="Choose a username"
          required
          pattern="^[a-zA-Z0-9_]+$"
          infoMessage="Your public name on RiffTube. Editable anytime."
          errorMessage="Letters, numbers, and underscores only"
        />
      </div>

      <TextInput
        id="signup-email"
        label="Email"
        value={email}
        onChange={onEmailChange}
        placeholder="Enter your email"
        required
        pattern="\S+@\S+\.\S+"
        errorMessage="Invalid email address"
      />

      <TextInput
        id="signup-password"
        label="Password"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Enter your password"
        required
        errorMessage={`Password must be at least ${PASSWORD_MIN_LENGTH} characters`}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      <p className="mt-2 mb-3 text-sm">
        By clicking Sign Up, you agree to RiffTube’s{' '}
        <InlineLink href="/terms">Terms of Service</InlineLink> and acknowledge
        our <InlineLink href="/guidelines">Community Guidelines</InlineLink>.
      </p>

      <Button
        disabled={loading || isFormInvalid}
        type="submit"
        className="mt-2 w-full text-2xl"
        size="lg"
      >
        {loading ? 'Signing up…' : 'Sign up'}
      </Button>
    </form>
  );
}
