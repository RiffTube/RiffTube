import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { makeRiff } from '@/testUtils/server';
import VideoCard from './VideoCard';

vi.mock('@/features/player/components/YouTubePlayer', () => ({
  default: ({
    videoId,
    onTime,
  }: {
    videoId: string;
    onTime: (t: number) => void;
  }) => {
    onTime(25); // call immediately
    return <div data-testid="youtube-player">{videoId}</div>;
  },
}));

vi.mock('@/features/riffs/components/RiffOverlay', () => ({
  default: ({
    riffs,
    currentTime,
  }: {
    riffs: Array<{ id: string; text: string; highlighted: boolean }>;
    currentTime: number;
  }) => (
    <div data-testid="riff-overlay" data-current-time={currentTime}>
      {riffs.map(r => (
        <span key={r.id} data-highlighted={String(r.highlighted)}>
          {r.text}
        </span>
      ))}
    </div>
  ),
}));

const riffs = [
  makeRiff(),
  makeRiff({ id: 'r2', start: 18, end: 25, text: 'Classic!' }),
];

describe('<VideoCard />', () => {
  it('renders the YouTubePlayer with the project videoId', () => {
    render(<VideoCard riffs={riffs} selectedId={null} videoId="MY_VIDEO_ID" />);

    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'MY_VIDEO_ID',
    );
  });

  it('passes the riffs and current time straight to the overlay', () => {
    render(<VideoCard riffs={riffs} selectedId={null} videoId="MY_VIDEO_ID" />);

    const overlay = screen.getByTestId('riff-overlay');
    expect(overlay).toHaveAttribute('data-current-time', '25');
    expect(overlay).toHaveTextContent('Wait for it...');
    expect(overlay).toHaveTextContent('Classic!');
  });

  it('renders an empty overlay when no riffs are provided', () => {
    render(<VideoCard riffs={[]} selectedId={null} videoId="MY_VIDEO_ID" />);

    const overlay = screen.getByTestId('riff-overlay');
    expect(overlay.children.length).toBe(0);
  });

  it('shows a message instead of a player when the project has no video', () => {
    render(<VideoCard riffs={riffs} selectedId={null} videoId={null} />);

    expect(screen.queryByTestId('youtube-player')).toBeNull();
    expect(screen.getByText(/no video/i)).toBeInTheDocument();
  });
});
