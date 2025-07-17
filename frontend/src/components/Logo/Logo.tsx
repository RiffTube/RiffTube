import { twMerge } from 'tailwind-merge';
import TvIcon from '@/assets/rifftube-logo.svg?react';

type LogoSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<LogoSize, { icon: string; text: string; gap: string }> = {
  sm: {
    icon: 'h-6 w-auto',
    text: 'text-lg sm:text-xl',
    gap: 'gap-1 sm:gap-2',
  },
  md: {
    icon: 'h-8 w-auto sm:h-10',
    text: 'text-2xl sm:text-3xl',
    gap: 'gap-2 sm:gap-3',
  },
  lg: {
    icon: 'h-8 w-auto sm:h-10 md:h-14 lg:h-20',
    text: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    gap: 'gap-2 sm:gap-4',
  },
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

function Logo({ size = 'lg', className = '' }: LogoProps) {
  const { icon, text, gap } = sizeMap[size];

  return (
    <div
      className={twMerge(
        `flex items-baseline justify-center md:justify-start ${gap}`,
        className,
      )}
    >
      <TvIcon className={twMerge('-mt-px', icon)} aria-hidden="true" />
      <h1 className={twMerge("font-['Limelight',cursive] leading-none", text)}>
        RiffTube
      </h1>
    </div>
  );
}

export default Logo;
