import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LandingPage from './LandingPage';

let signInMock: ReturnType<typeof vi.fn>;
let signUpMock: ReturnType<typeof vi.fn>;

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    signIn: signInMock,
    signUp: signUpMock,
    signOut: vi.fn(),
  }),
}));

describe('<LandingPage />', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

  it('renders the hero word-mark', () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    renderPage();

    const heroHeading = screen.getByRole('heading', {
      level: 1,
      name: /rifftube/i,
    });
    expect(heroHeading).toBeInTheDocument();
  });

  it('renders the “How It Works” section', () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /how it works/i }),
    ).toBeInTheDocument();
  });

  it('renders the FAQ section', () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /faq/i }),
    ).toBeInTheDocument();
  });

  it('opens the Sign-Up modal when clicking “Start Riffing”', () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /start riffing/i }));

    expect(
      screen.getByRole('dialog', { name: /join rifftube today/i }),
    ).toBeInTheDocument();
  });

  it('opens the Sign-In modal when clicking “Sign In” in the header', () => {
    signInMock = vi.fn();
    signUpMock = vi.fn();
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      screen.getByRole('dialog', { name: /sign in to rifftube/i }),
    ).toBeInTheDocument();
  });
});
