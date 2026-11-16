import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('<Footer />', () => {
  it('renders Facebook, Twitter and YouTube links with correct hrefs and aria-labels', () => {
    render(<Footer />);
    const links = [
      { name: /facebook/i, href: 'https://facebook.com' },
      { name: /twitter/i, href: 'https://twitter.com' },
      { name: /youtube/i, href: 'https://youtube.com' },
    ] as const;

    links.forEach(({ name, href }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('renders the RiffTube wordmark', () => {
    render(<Footer />);
    const brand = screen.getByText(/rifftube/i);
    expect(brand).toBeInTheDocument();
    expect(brand.tagName).toBe('SPAN');
  });

  it('renders the TV icon with aria-hidden', () => {
    render(<Footer />);
    // find the SVG next to the RiffTube text
    const brandContainer = screen.getByText(/rifftube/i).closest('div');
    expect(brandContainer).toBeTruthy();

    const svg = brandContainer!.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a footer element', () => {
    render(<Footer />);
    // The footer element has an implicit role "contentinfo"
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
