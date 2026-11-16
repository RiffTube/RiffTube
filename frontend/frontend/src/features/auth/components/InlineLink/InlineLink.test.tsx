import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import InlineLink from './InlineLink';

describe('InlineLink component', () => {
  it('renders children and default classes', () => {
    render(<InlineLink href="#">Click here</InlineLink>);
    const link = screen.getByText('Click here');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#');
  });

  it('merges custom className with default', () => {
    render(
      <InlineLink href="#" className="custom-class">
        Link Text
      </InlineLink>,
    );
    const link = screen.getByText('Link Text');
    expect(link).toHaveClass('custom-class');
  });

  it('handles onClick events', () => {
    const onClick = vi.fn();
    render(
      <InlineLink href="#" onClick={onClick}>
        Test Link
      </InlineLink>,
    );
    const link = screen.getByText('Test Link');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
