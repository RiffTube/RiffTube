import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

describe('<LandingPage />', () => {
  it('renders the hero section with the main wordmark', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const heroHeading = screen.getByRole('heading', {
      level: 1,
      name: /rifftube/i,
    });
    expect(heroHeading).toBeInTheDocument();
  });

  it('renders the "How It Works" section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const howItWorksHeading = screen.getByRole('heading', {
      level: 2,
      name: /how it works/i,
    });
    expect(howItWorksHeading).toBeInTheDocument();
  });

  it('renders the FAQ section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    const faqHeading = screen.getByRole('heading', {
      level: 2,
      name: /faq/i,
    });
    expect(faqHeading).toBeInTheDocument();
  });

  it('opens the Sign-Up modal when clicking "Start Riffing"', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // click the CTA in HeroSection
    const startBtn = screen.getByRole('button', { name: /start riffing/i });
    fireEvent.click(startBtn);

    expect(
      screen.getByRole('dialog', { name: /join rifftube today/i }),
    ).toBeInTheDocument();
  });

  it('opens the Sign-In modal when clicking "Sign In" in the header', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // click the header Sign In button
    const signInBtn = screen.getByRole('button', { name: /^sign in$/i });
    fireEvent.click(signInBtn);

    // The SignInModal has a "Sign in with Google" button:
    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });
});
