import { render, screen } from '@testing-library/react';
import RiffOverlay, { Riff } from './RiffOverlay';

const baseRiffs: Riff[] = [
  { id: 'r1', start: 0, end: 5, text: 'First riff' },
  { id: 'r2', start: 3, end: 8, text: 'Second riff' },
  { id: 'r3', start: 10, end: 12, text: 'Third riff' },
];

describe('<RiffOverlay />', () => {
  it('renders no spans when no riffs match the currentTime', () => {
    const { container } = render(
      <RiffOverlay riffs={baseRiffs} currentTime={9} />,
    );
    // none of the three riffs cover time=9, so there should be 0 <span> elements
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(0);
  });

  it('renders exactly one span when only one riff matches', () => {
    render(<RiffOverlay riffs={baseRiffs} currentTime={1} />);
    // only the first riff (0–5) covers 1
    expect(screen.getByText('First riff')).toBeInTheDocument();
    expect(screen.queryByText('Second riff')).toBeNull();
    expect(screen.queryByText('Third riff')).toBeNull();
  });

  it('renders all matching riffs when multiple overlap', () => {
    render(<RiffOverlay riffs={baseRiffs} currentTime={4} />);
    // at t=4 both r1 (0–5) and r2 (3–8) match
    expect(screen.getByText('First riff')).toBeInTheDocument();
    expect(screen.getByText('Second riff')).toBeInTheDocument();
    expect(screen.queryByText('Third riff')).toBeNull();
  });

  it('applies the correct Tailwind classes on the container and spans', () => {
    const { container } = render(
      <RiffOverlay riffs={baseRiffs} currentTime={1} />,
    );

    // wrapper is the first child of container
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'pointer-events-none',
      'absolute',
      'bottom-10',
      'w-full',
      'text-center',
    );

    // check one of the rendered spans
    const span = screen.getByText('First riff');
    expect(span).toHaveClass(
      'inline-block',
      'rounded',
      'bg-black/70',
      'px-4',
      'py-1',
      'text-white',
      'transition-opacity',
      'duration-200',
    );
  });

  it('renders a riff when currentTime equals its start time', () => {
    render(<RiffOverlay riffs={baseRiffs} currentTime={0} />);
    expect(screen.getByText('First riff')).toBeInTheDocument();
  });

  it('renders riffs when currentTime equals their end time', () => {
    render(<RiffOverlay riffs={baseRiffs} currentTime={5} />);
    expect(screen.getByText('First riff')).toBeInTheDocument();
    expect(screen.getByText('Second riff')).toBeInTheDocument();
  });
});
