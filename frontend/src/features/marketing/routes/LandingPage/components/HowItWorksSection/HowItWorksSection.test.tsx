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

  it('lists exactly three steps, in order', () => {
    render(<HowItWorksSection />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items.map(item => item.querySelector('h3')?.textContent)).toEqual([
      'Pick Your Video',
      'Add Your Riffs',
      'Share the Fun',
    ]);
  });

  it("renders each step's title and description", () => {
    render(<HowItWorksSection />);
    steps.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });
});
