import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import GoogleLogo from '@/assets/google.svg?react';
import Button, { ButtonProps } from '@/components/Button';

export type OAuthProvider = 'google';

type Mode = 'signin' | 'signup';

export interface OAuthButtonProps extends Omit<ButtonProps, 'variant'> {
  provider?: OAuthProvider;
  mode?: Mode;
  textOverride?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

function OAuthButton({
  disabled = false,
  isLoading = false,
  provider = 'google',
  mode = 'signup',
  textOverride,
  onClick,
  className = '',
  ...rest
}: OAuthButtonProps) {
  const providerName: Record<OAuthProvider, string> = {
    google: 'Google',
  };

  const iconByProvider: Record<OAuthProvider, ReactNode> = {
    google: <GoogleLogo className="h-5 w-5" aria-hidden="true" />,
  };

  const prefixByMode: Record<Mode, string> = {
    signin: 'Sign in with',
    signup: 'Sign up with',
  };

  const label =
    textOverride ?? `${prefixByMode[mode]} ${providerName[provider]}`;

  const mergedClasses = twMerge(
    'flex w-full items-center justify-start gap-2 py-3',
    className,
  );

  return (
    <Button
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
      variant="lightMode"
      className={mergedClasses}
      aria-label={label}
      data-provider={provider}
      data-mode={mode}
      {...rest}
    >
      {iconByProvider[provider]}
      <span className="ml-2 font-medium">{label}</span>
    </Button>
  );
}

export default OAuthButton;
