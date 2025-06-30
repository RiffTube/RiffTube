import { twMerge } from 'tailwind-merge';
import GoogleLogo from '@/assets/google.svg?react';
import CTAButton, { CTAButtonProps } from '@/components/CTAButton';

export type OAuthProvider = 'google'; // later could include: | 'github' | 'apple'

export interface OAuthButtonProps extends Omit<CTAButtonProps, 'variant'> {
  provider?: OAuthProvider;
}

function OAuthButton({
  provider = 'google',
  onClick,
  className = '',
  ...rest
}: OAuthButtonProps) {
  const config: Record<
    OAuthProvider,
    { icon: React.ReactNode; label: string }
  > = {
    google: {
      icon: <GoogleLogo className="h-5 w-5" aria-hidden="true" />,
      label: 'Sign in with Google',
    },
  };

  const { icon, label } = config[provider];

  const mergedClasses = twMerge(
    'flex w-full items-center justify-center gap-2 py-3',
    className,
  );

  return (
    <CTAButton
      onClick={onClick}
      variant="lightMode"
      className={mergedClasses}
      {...rest}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </CTAButton>
  );
}

export default OAuthButton;
