import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Dialog } from '@headlessui/react';
import { describe, expect, it } from 'vitest';
import AuthModalLayout from './AuthModalLayout';

describe('AuthModalLayout', () => {
  it('renders the title and children without footer by default', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <AuthModalLayout title="Test Title">
          <div data-testid="child">Child content</div>
        </AuthModalLayout>
      </Dialog>,
    );

    // The DialogTitle should produce an <h2> with the given title
    const heading = screen.getByRole('heading', { name: /Test Title/ });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');

    // Your child is rendered
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');

    // No footer by default
    expect(screen.queryByText('Footer content')).toBeNull();
  });

  it('renders the footer when provided', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <AuthModalLayout
          title="Another Title"
          footer={<span>Footer content</span>}
        >
          <p>Some children</p>
        </AuthModalLayout>
      </Dialog>,
    );

    // Footer appears when passed
    const footer = screen.getByText('Footer content');
    expect(footer).toBeInTheDocument();
    expect(footer).toBeVisible();

    // And it still renders the children
    expect(screen.getByText('Some children')).toBeInTheDocument();
  });
});
