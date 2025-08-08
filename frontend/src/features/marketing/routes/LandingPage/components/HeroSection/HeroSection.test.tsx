import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest'; // ← make sure you import vi
import HeroSection from './HeroSection';

describe('<HeroSection />', () => {
  it('renders all three tagline lines', () => {
    render(<HeroSection openSignUp={() => {}} />);
    ['Your voice.', 'Your commentary.', 'Your movie night.'].forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('renders a "Start Riffing" button and calls openSignUp when clicked', () => {
    const openSignUp = vi.fn();
    render(<HeroSection openSignUp={openSignUp} />);

    const btn = screen.getByRole('button', { name: /start riffing/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(openSignUp).toHaveBeenCalledTimes(1);
  });

  it('renders the Logo SVG and hides it from screen readers', () => {
    render(<HeroSection openSignUp={() => {}} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
