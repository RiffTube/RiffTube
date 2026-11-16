import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuthState } from '@/testUtils/mockUseAuth'; // adjust path if needed
import Layout from './Layout';

mockAuthState();

describe('<Layout />', () => {
  it('renders the Header component in a banner landmark', () => {
    render(
      <MemoryRouter>
        <Layout openSignIn={() => {}}>
          <div>Child</div>
        </Layout>
      </MemoryRouter>,
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the Footer component in a contentinfo landmark', () => {
    render(
      <MemoryRouter>
        <Layout openSignIn={() => {}}>
          <div>Child</div>
        </Layout>
      </MemoryRouter>,
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders its children inside the main region', () => {
    render(
      <MemoryRouter>
        <Layout openSignIn={() => {}}>
          <p>Test child content</p>
        </Layout>
      </MemoryRouter>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('Test child content')).toBeInTheDocument();
  });
});
