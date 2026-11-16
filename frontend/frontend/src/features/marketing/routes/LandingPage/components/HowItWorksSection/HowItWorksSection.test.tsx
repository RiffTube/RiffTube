import { render, screen } from '@testing-library/react';
import HowItWorksSection from './HowItWorksSection';

describe('<HowItWorksSection />', () => {
  const steps = [
    {
      title: 'Pick Your Video',
      description: 'Find any YouTube video that deserves your genius',
    },
    {
      title: 'Add Your Riffs',
      description: 'Record your voice or add subtitles',
    },
    {
      title: 'Share the Fun',
      description:
        'Send your riffed creation to friends—or broadcast it to the world.',
    },
  ];

  it('renders the section heading as an H2 with "How It Works"', () => {
    render(<HowItWorksSection />);
    const heading = screen.getByRole('heading', { name: /how it works/i });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders exactly three step cards in the grid', () => {
    const { container } = render(<HowItWorksSection />);
    const grid = container.querySelector('div.grid');
    expect(grid).toBeInTheDocument();
    expect(grid!.children).toHaveLength(3);
  });

  it("renders each step's title and description", () => {
    render(<HowItWorksSection />);
    steps.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
