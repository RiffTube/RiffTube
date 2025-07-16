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
    onTime(25);
    return <div data-testid="youtube-player">{videoId}</div>;
  },
}));

vi.mock('../../../../../riffs/components/RiffOverlay', () => ({
  default: ({
    riffs,
  }: {
    riffs: Array<{ id: string; text: string; highlighted: boolean }>;
    currentTime: number; // include currentTime to mirror real props
  }) => (
    <div data-testid="riff-overlay">
      {riffs.map(r => (
        <span key={r.id} data-highlighted={String(r.highlighted)}>
          {r.text}
        </span>
      ))}
    </div>
  ),
}));

describe('VideoCard', () => {
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

  it('passes only the riffs visible at t=25 into RiffOverlay, marking the selected one highlighted', () => {
    // pick the second riff as selected
    const selected = dummyRiffs[1].id;
    render(<VideoCard riffs={dummyRiffs} selectedId={selected} />);

    const overlay = screen.getByTestId('riff-overlay');
    // determine which dummyRiffs are in range at t=25
    const visible = dummyRiffs.filter(
      r => 25 >= r.start && 25 <= r.start + r.duration,
    );

    visible.forEach(r => {
      const span = screen.getByText(r.text!);
      expect(span).toHaveAttribute(
        'data-highlighted',
        String(r.id === selected),
      );
      expect(overlay).toContainElement(span);
    });
  });

  it('renders an empty overlay when no riffs are provided', () => {
    render(<VideoCard riffs={[]} selectedId={null} />);
    const overlay = screen.getByTestId('riff-overlay');
    expect(overlay.children.length).toBe(0);
  });

  it('does not highlight any riff if selectedId does not match any riff', () => {
    render(<VideoCard riffs={dummyRiffs} selectedId="NON_EXISTENT_ID" />);
    // filter visible riffs at t=25
    const visible = dummyRiffs.filter(
      r => 25 >= r.start && 25 <= r.start + r.duration,
    );

    visible.forEach(r => {
      const span = screen.getByText(r.text!);
      expect(span).toHaveAttribute('data-highlighted', 'false');
    });
  });
});
