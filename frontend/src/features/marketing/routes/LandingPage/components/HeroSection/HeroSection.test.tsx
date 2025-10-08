// HeroSection.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockAuthState, resetUseAuthMock } from '@/testUtils/mockUseAuth';
import HeroSection from './HeroSection';

// mock useNavigate so we can assert redirects
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('<HeroSection />', () => {
  it('renders all three tagline lines', () => {
    mockNavigate.mockReset();
    resetUseAuthMock();
    mockAuthState({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <HeroSection openSignUp={() => {}} />
      </MemoryRouter>,
    );

    ['Your voice.', 'Your commentary.', 'Your movie night.'].forEach(t => {
      expect(screen.getByText(t)).toBeInTheDocument();
    });
  });

  it('signed OUT: clicking the CTA calls openSignUp (no navigation)', () => {
    mockNavigate.mockReset();
    resetUseAuthMock();
    mockAuthState({ isAuthenticated: false, user: null });

    const openSignUp = vi.fn();
    render(
      <MemoryRouter>
        <HeroSection openSignUp={openSignUp} />
      </MemoryRouter>,
    );

    // Label is always "Start Riffing" now
    const btn = screen.getByRole('button', { name: /start riffing/i });
    fireEvent.click(btn);

    expect(openSignUp).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('signed IN: clicking the CTA navigates to /dashboard (does not call openSignUp)', () => {
    mockNavigate.mockReset();
    resetUseAuthMock();
    mockAuthState({
      isAuthenticated: true,
      user: { id: 'u1', username: 'Joss', email: 'joss@example.com' },
    });

    const openSignUp = vi.fn();
    render(
      <MemoryRouter>
        <HeroSection openSignUp={openSignUp} />
      </MemoryRouter>,
    );

    // Button text is still "Start Riffing"
    const btn = screen.getByRole('button', { name: /start riffing/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(openSignUp).not.toHaveBeenCalled();
  });

  it('renders the Logo SVG and hides it from screen readers', () => {
    mockNavigate.mockReset();
    resetUseAuthMock();
    mockAuthState({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <HeroSection openSignUp={() => {}} />
      </MemoryRouter>,
    );

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
