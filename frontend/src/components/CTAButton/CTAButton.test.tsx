import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CTAButton, { Size } from './CTAButton';

describe('CTAButton', () => {
  it('renders children when not loading', () => {
    render(<CTAButton>Click me</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Click me');
    expect(button).not.toBeDisabled();
  });

  it('renders spinner and disables button when loading', () => {
    render(<CTAButton isLoading>Submit</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveTextContent('Submit');
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('defaults to primary variant and md size', () => {
    render(<CTAButton>Default</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('px-4');
  });

  it('applies secondary variant', () => {
    render(<CTAButton variant="secondary">Secondary</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-700');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('hover:bg-gray-600');
  });

  it('applies lightMode variant', () => {
    render(<CTAButton variant="lightMode">Light Mode</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-gray-900');
    expect(button).toHaveClass('hover:bg-gray-50');
  });

  it('applies size variants correctly', () => {
    const sizes: Record<Size, [string, string]> = {
      sm: ['h-9', 'px-3'],
      md: ['h-12', 'px-4'],
      lg: ['h-14', 'px-6'],
    };
    (Object.keys(sizes) as Size[]).forEach(size => {
      render(<CTAButton size={size}>Size {size}</CTAButton>);
      const button = screen.getByRole('button', { name: `Size ${size}` });
      const [heightClass, paddingClass] = sizes[size];
      expect(button).toHaveClass(heightClass);
      expect(button).toHaveClass(paddingClass);
    });
  });

  it('applies active classes when enabled and not loading', () => {
    render(<CTAButton>ActiveTest</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('active:opacity-75');
    expect(button).toHaveClass('active:scale-95');
  });

  it('does not apply active classes when disabled', () => {
    render(<CTAButton disabled>Disabled</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('active:opacity-75');
    expect(button).not.toHaveClass('active:scale-95');
  });

  it('does not apply active classes when loading', () => {
    render(<CTAButton isLoading>Loading</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('active:opacity-75');
    expect(button).not.toHaveClass('active:scale-95');
  });

  it('accepts custom className', () => {
    render(<CTAButton className="custom-class">Custom</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('supports custom type prop', () => {
    render(<CTAButton type="submit">Submit</CTAButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('forwards onClick handler', () => {
    const handleClick = vi.fn();
    render(<CTAButton onClick={handleClick}>Click</CTAButton>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses aria-label when provided', () => {
    render(<CTAButton ariaLabel="Accessible">Labelled</CTAButton>);
    const button = screen.getByLabelText('Accessible');
    expect(button).toBeInTheDocument();
  });
});
