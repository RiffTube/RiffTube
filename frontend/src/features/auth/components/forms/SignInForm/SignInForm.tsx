import { useState } from 'react';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface SignInFormProps {
  onSuccess?: () => void;
  className?: string;
  busy?: boolean;
}

export default function SignInForm({
  onSuccess,
  className = '',
}: SignInFormProps) {
  const { signIn, loading, error, clearError } = useAuth();

  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const loginTrim = login.trim();
  const passwordTrim = password.trim();
  const isFormInvalid = loginTrim.length === 0 || passwordTrim.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid || loading) return;

    try {
      await signIn(login.trim(), password.trim());
      onSuccess?.();
    } catch {
      // Error string is already set by useAuth; we just leave the message displayed.
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setLogin(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setPassword(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mt-6">
        <TextInput
          id="signin-login"
          label="Email or username"
          value={login}
          onChange={handleLoginChange}
          placeholder="you@example.com or your username"
          required
        />
      </div>

      <TextInput
        id="signin-password"
        label="Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your password"
        required
      />

      {error && (
        <p className="mt-2 mb-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <Button
        disabled={loading || isFormInvalid}
        type="submit"
        className="mt-4 w-full text-2xl"
        size="lg"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
