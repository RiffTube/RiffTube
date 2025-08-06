import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import OAuthButton from './OAuthButton';

describe('OAuthButton', () => {
  it('renders Google icon and default "Sign up with Google" label', () => {
    render(<OAuthButton />);

    const button = screen.getByRole('button', { name: /sign up with google/i });
    expect(button).toBeInTheDocument();

    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders "Sign in with Google" when mode="signin"', () => {
    render(<OAuthButton mode="signin" />);
    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it('uses textOverride when provided', () => {
    render(<OAuthButton textOverride="Continue with Google" />);
    expect(
      screen.getByRole('button', { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<OAuthButton onClick={handleClick} />);
    const button = screen.getByRole('button', { name: /sign up with google/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards additional className to the underlying button', () => {
    render(<OAuthButton className="my-custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('my-custom-class');
  });

  it('sets aria-label and data attributes reflecting provider and mode', () => {
    render(<OAuthButton provider="google" mode="signin" />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    expect(button).toHaveAttribute('aria-label', 'Sign in with Google');
    expect(button).toHaveAttribute('data-provider', 'google');
    expect(button).toHaveAttribute('data-mode', 'signin');
  });
});
