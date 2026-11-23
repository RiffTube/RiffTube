import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudioSidebar from './StudioSidebar';

describe('<StudioSidebar />', () => {
  it('sends "My Projects" to the dashboard, where the project list lives', () => {
    render(
      <MemoryRouter>
        <StudioSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'My Projects' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});

describe('<StudioSidebar /> on the dashboard', () => {
  it('marks only Home as the current page', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <StudioSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'My Projects' }),
    ).not.toHaveAttribute('aria-current');
  });

  it('does not mark Home on pages below the dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/projects/new']}>
        <StudioSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
