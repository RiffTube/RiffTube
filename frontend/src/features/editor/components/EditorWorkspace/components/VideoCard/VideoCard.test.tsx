import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { dummyRiffs } from '../../../../data/dummyRiffs';
import VideoCard from './VideoCard';

vi.mock('../../../../../player/components/YouTubePlayer', () => ({
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

vi.mock('../../../../../riffs/components/RiffOverlay', () => ({
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

describe('<VideoCard />', () => {
  it('renders the YouTubePlayer with the provided videoId', () => {
    render(
      <VideoCard riffs={dummyRiffs} selectedId={null} videoId="MY_CUSTOM_ID" />,
    );

    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'MY_CUSTOM_ID',
    );
  });

  it('uses the fallback videoId when none is provided', () => {
    render(<VideoCard riffs={dummyRiffs} selectedId={null} />);

    expect(screen.getByTestId('youtube-player')).toHaveTextContent(
      'dQw4w9WgXcQ',
    );
  });

  it('renders an empty overlay when no riffs are provided', () => {
    render(<VideoCard riffs={[]} selectedId={null} />);

    const overlay = screen.getByTestId('riff-overlay');
    expect(overlay.children.length).toBe(0);
  });
});
