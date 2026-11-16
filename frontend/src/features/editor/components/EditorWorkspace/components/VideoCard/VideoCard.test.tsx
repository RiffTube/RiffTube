import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PlayerProvider } from '@/features/player/context';
import { makeRiff } from '@/testUtils/server';
import VideoCard from './VideoCard';

// A player that reports being 6 seconds in as soon as it mounts.
vi.mock('@/features/player/components/YouTubePlayer', () => ({
  default: function MockPlayer({
    videoId,
    onTime,
  }: {
    videoId: string;
    onTime: (seconds: number) => void;
  }) {
    useEffect(() => onTime(6), [onTime]);
    return <div data-testid="youtube-player">{videoId}</div>;
  },
}));

const riffs = [
  makeRiff({ id: 'r1', start: 5, end: 9, text: 'Wait for it...' }),
  makeRiff({ id: 'r2', start: 18, end: 25, text: 'Classic!' }),
];

const renderCard = (props: Partial<Parameters<typeof VideoCard>[0]> = {}) =>
  render(
    <PlayerProvider>
      <VideoCard riffs={riffs} videoId="MY_VIDEO_ID" {...props} />
    </PlayerProvider>,
  );

describe('<VideoCard />', () => {
  it('renders the YouTubePlayer with the project videoId', () => {
    renderCard();

    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'MY_VIDEO_ID',
    );
  });

  it('shows the riffs that cover the time the player reports', () => {
    renderCard();

    expect(screen.getByText('Wait for it...')).toBeInTheDocument();
    expect(screen.queryByText('Classic!')).toBeNull();
  });

  it('shows a message instead of a player when the project has no video', () => {
    renderCard({ videoId: null });

    expect(screen.queryByTestId('youtube-player')).toBeNull();
    expect(screen.getByText(/no video/i)).toBeInTheDocument();
  });
});
