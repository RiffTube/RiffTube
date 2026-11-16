import { render, screen } from '@testing-library/react';
import FAQSection from './FAQSection';

describe('<FAQSection />', () => {
  it('renders the section heading as an H2 with "FAQ"', () => {
    render(<FAQSection />);
    const heading = screen.getByRole('heading', { name: /faq/i });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders two description lists (<dl>) for mobile and desktop layouts', () => {
    render(<FAQSection />);
    const dlElements = document.querySelectorAll('dl');
    expect(dlElements.length).toBe(2);
  });

  it('renders all FAQ questions twice (accordion + expanded)', () => {
    render(<FAQSection />);
    const questions = [
      'Do I need a YouTube account to use RiffTube?',
      'Can I keep my riffs private?',
      'Can I invite friends to riff with me?',
      'Do I need to install anything?',
      'What happens if the video is removed from YouTube?',
    ];
    questions.forEach(question => {
      // each question should appear twice
      // once in the mobile accordion list, once in the desktop list
      const matches = screen.getAllByText(question);
      expect(matches.length).toBe(2);
    });
  });
});
