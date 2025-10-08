import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { mockAuthState } from '@/testUtils/mockUseAuth';
import Header from './Header';

mockAuthState();

describe('<Header />', () => {
  it('renders a <header> banner and a <nav>', () => {
    mockAuthState({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <Header openSignIn={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('when signed OUT: logo links to "/" and shows Sign In', () => {
    mockAuthState({ isAuthenticated: false, user: null });

    render(
      <MemoryRouter>
        <Header openSignIn={() => {}} />
      </MemoryRouter>,
    );

    const homeLink =
      screen.queryByRole('link', { name: /home/i }) ??
      screen.getAllByRole('link').find(l => l.getAttribute('href') === '/');

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    const svg = homeLink!.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a "Sign In" button and calls openSignIn when clicked', () => {
    mockAuthState({ isAuthenticated: false, user: null });
    const open = vi.fn();

    render(
      <MemoryRouter>
        <Header openSignIn={open} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('when signed IN: logo links to "/dashboard" and shows avatar + Sign Out', () => {
    const signOut = vi.fn();
    mockAuthState({
      isAuthenticated: true,
      user: { id: 'u1', username: 'Joss', email: 'joss@example.com' },
      signOut,
    });

    render(
      <MemoryRouter>
        <Header openSignIn={() => {}} />
      </MemoryRouter>,
    );

    const logoLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(logoLink).toHaveAttribute('href', '/dashboard');

    // avatar + username visible, no "Sign In"
    expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    expect(screen.getByText('Joss')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();

    // sign out works
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
