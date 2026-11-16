import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { mockAuthState } from '@/testUtils/mockUseAuth'; // adjust path if needed
import LandingPage from './LandingPage';

mockAuthState({
  user: null,
  isAuthenticated: false,
  isInitialized: true,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
});

describe('<LandingPage />', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

  it('renders the hero word-mark', () => {
    renderPage();

    const heroHeading = screen.getByRole('heading', {
      level: 1,
      name: /rifftube/i,
    });
    expect(heroHeading).toBeInTheDocument();
  });

  it('renders the “How It Works” section', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /how it works/i }),
    ).toBeInTheDocument();
  });

  it('renders the FAQ section', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: /faq/i }),
    ).toBeInTheDocument();
  });

  it('opens the Sign-Up modal when clicking “Start Riffing”', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /start riffing/i }));

    expect(
      screen.getByRole('dialog', { name: /join rifftube today/i }),
    ).toBeInTheDocument();
  });

  it('opens the Sign-In modal when clicking “Sign In” in the header', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      screen.getByRole('dialog', { name: /sign in to rifftube/i }),
    ).toBeInTheDocument();
  });
});
