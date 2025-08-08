import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuthState } from '@/testUtils/mockUseAuth';
import Header from './Header';

mockAuthState();

describe('<Header />', () => {
  it('renders a <header> banner and a <nav>', () => {
    render(
      <MemoryRouter>
        <Header openSignIn={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders a home link pointing to "/" with the TV icon inside', () => {
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
  });

  it('renders a "Sign In" button and calls openSignIn when clicked', () => {
    const mockOpen = vi.fn();

    render(
      <MemoryRouter>
        <Header openSignIn={mockOpen} />
      </MemoryRouter>,
    );

    const btn = screen.getByRole('button', { name: /sign in/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
