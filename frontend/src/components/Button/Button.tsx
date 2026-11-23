import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type Variant = 'primary' | 'secondary' | 'lightMode' | 'ghost';
export type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** Visual style */
  variant?: Variant;
  /** Button size */
  size?: Size;
  /** Show spinner & disable */
  isLoading?: boolean;
  /** Accessible label when using icon-only content */
  ariaLabel?: string;
  /** Additional classes to merge */
  className?: string;
  disabled?: boolean;
}

const base =
  'cursor-pointer inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold transition-colors ' +
  'focus-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none';

const variantMap: Record<Variant, string> = {
  /** Filled burgundy with paper text: the one main action in a region. */
  primary: 'bg-primary text-paper hover:bg-primary-dark disabled:bg-primary/40',

  /** Quiet outlined action that sits beside a primary one. */
  secondary:
    'border border-strong-outline bg-surface-3 text-paper hover:border-smoke hover:bg-[#363236] ' +
    'disabled:opacity-40',

  /** Paper-filled; reads as a light button on dark surfaces. */
  lightMode:
    'bg-paper text-ink hover:bg-paper-dim ' +
    'disabled:bg-paper-dim disabled:text-muted-light',

  /** Text-weight action for low-priority or destructive choices. */
  ghost:
    'bg-transparent text-muted-dark hover:bg-white/5 hover:text-paper ' +
    'disabled:opacity-40',
};

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4',
  lg: 'h-14 px-6 text-lg',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
  ...rest
}: ButtonProps) {
  const activeClasses =
    !disabled && !isLoading ? 'active:opacity-75 active:scale-95' : '';

  const classes = twMerge(
    base,
    variantMap[variant],
    sizeMap[size],
    activeClasses,
    className,
  );

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      className={classes}
      {...rest}
    >
      {isLoading ? (
        <svg
          aria-hidden="true"
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
