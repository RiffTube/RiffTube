import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import OAuthButton from './OAuthButton';

describe('OAuthButton', () => {
  it('renders Google icon and default label', () => {
    const handleClick = vi.fn();
    render(<OAuthButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();

    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<OAuthButton provider="google" onClick={handleClick} />);
    const button = screen.getByRole('button', { name: /sign in with google/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards additional className to the CTAButton', () => {
    const handleClick = vi.fn();
    render(
      <OAuthButton
        provider="google"
        onClick={handleClick}
        className="my-custom-class"
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('my-custom-class');
  });
});
