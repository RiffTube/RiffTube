import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import DividerWithText from './DividerWithText';

describe('DividerWithText component', () => {
  it('renders children text', () => {
    render(<DividerWithText>or</DividerWithText>);
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('wraps children in a span with correct classes', () => {
    render(<DividerWithText>and</DividerWithText>);
    const span = screen.getByText('and');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass('px-4', 'text-sm', 'text-gray-400');
  });

  it('renders two horizontal rules with correct classes', () => {
    render(<DividerWithText>split</DividerWithText>);
    const hrs = screen.getAllByRole('separator');
    // note: <hr> elements have implicit role="separator"
    expect(hrs).toHaveLength(2);
    hrs.forEach(hr => {
      expect(hr).toHaveClass('flex-grow', 'border-gray-600');
    });
  });

  it('container has flex and margin classes', () => {
    render(<DividerWithText>test</DividerWithText>);
    const container = screen.getByText('test').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'my-6');
  });
});
