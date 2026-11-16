import { render, screen } from '@testing-library/react';
import Card, { CardProps } from './Card';

// A simple mock SVG icon component
const MockIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg data-testid="mock-icon" {...props} />
);

describe('<Card />', () => {
  const defaultProps: CardProps = {
    number: 42,
    title: 'Test Title',
    Icon: MockIcon,
    children: 'This is a test description',
  };

  it('renders the title as an H3', () => {
    render(<Card {...defaultProps} />);
    const heading = screen.getByRole('heading', {
      level: 3,
      name: /test title/i,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('renders the provided Icon component', () => {
    render(<Card {...defaultProps} />);
    const icon = screen.getByTestId('mock-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders its children inside a <p>', () => {
    render(<Card {...defaultProps} />);
    const paragraph = screen.getByText(/this is a test description/i);
    expect(paragraph).toBeInTheDocument();
    expect(paragraph.tagName).toBe('P');
  });
});
