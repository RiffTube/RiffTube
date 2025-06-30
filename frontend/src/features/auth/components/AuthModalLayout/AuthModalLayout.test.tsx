import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import AuthModalLayout from './AuthModalLayout';

describe('AuthModalLayout', () => {
  it('renders the title and children without footer by default', () => {
    render(
      <AuthModalLayout title="Test Title">
        <div data-testid="child">Child content</div>
      </AuthModalLayout>,
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Test Title');

    expect(screen.getByTestId('child')).toBeInTheDocument();

    const footer = screen.queryByText('Footer content');
    expect(footer).toBeNull();
  });

  it('renders the footer when provided', () => {
    render(
      <AuthModalLayout
        title="Another Title"
        footer={<span>Footer content</span>}
      >
        <p>Some children</p>
      </AuthModalLayout>,
    );

    const footer = screen.getByText('Footer content');

    expect(footer).toBeInTheDocument();
    expect(footer).toBeVisible();
  });
});
