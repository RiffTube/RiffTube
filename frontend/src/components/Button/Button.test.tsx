import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Button, { Size } from './Button';

describe('Button', () => {
  it('renders children when not loading', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveTextContent('Click me');
    expect(button).not.toBeDisabled();
  });

  it('renders spinner and disables when loading', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    // spinner replaces children
    expect(button).not.toHaveTextContent('Submit');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('defaults to primary + md size', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('px-4');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-reel-dust');
  });

  it('applies lightMode variant', () => {
    render(<Button variant="lightMode">Light Mode</Button>);
    const button = screen.getByRole('button', { name: /light mode/i });
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-gray-900');
  });

  it.each<[Size, string, string]>([
    ['sm', 'h-9', 'px-3'],
    ['md', 'h-12', 'px-4'],
    ['lg', 'h-14', 'px-6'],
  ])('applies %s size classes', (size, hCls, pxCls) => {
    render(<Button size={size}>Size {size}</Button>);
    const button = screen.getByRole('button', {
      name: new RegExp(`Size ${size}`, 'i'),
    });
    expect(button).toHaveClass(hCls);
    expect(button).toHaveClass(pxCls);
  });

  it('omits active classes when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).not.toHaveClass('active:opacity-75');
    expect(button).not.toHaveClass('active:scale-95');
  });

  it('omits active classes when loading', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('active:opacity-75');
    expect(button).not.toHaveClass('active:scale-95');
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('supports custom type prop', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('forwards onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button', { name: /click/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses aria-label when provided', () => {
    render(
      <Button ariaLabel="Accessible">
        {/* Intentionally different visible text */}
        Labelled
      </Button>,
    );
    const button = screen.getByLabelText('Accessible');
    expect(button).toBeInTheDocument();
  });
});
