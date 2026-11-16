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
