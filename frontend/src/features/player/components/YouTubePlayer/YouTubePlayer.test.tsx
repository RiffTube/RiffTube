import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import YouTubePlayer from './YouTubePlayer';

const mockGetCurrentTime = vi.fn();
const mockPlayer = { getCurrentTime: mockGetCurrentTime };

vi.mock('react-youtube', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ videoId, onReady, className, opts }: any) => {
      // simulate mount → ready
      onReady({ target: mockPlayer });
      return (
        <div
          data-testid="youtube-iframe"
          data-video-id={videoId}
          data-classname={className}
          data-opts={JSON.stringify(opts)}
        />
      );
    },
  };
});

describe('YouTubePlayer', () => {
  it('renders the YouTube stub with correct props', () => {
    const onTime = vi.fn();
    const { getByTestId } = render(
      <YouTubePlayer videoId="abc123" onTime={onTime} />,
    );

    const stub = getByTestId('youtube-iframe');
    expect(stub).toHaveAttribute('data-video-id', 'abc123');
    expect(stub).toHaveAttribute('data-classname', 'h-full w-full');
    expect(JSON.parse(stub.getAttribute('data-opts')!)).toEqual({
      width: '100%',
      height: '100%',
    });
  });

  it('polls the player every 250ms and calls onTime', () => {
    vi.useFakeTimers();
    try {
      mockGetCurrentTime.mockReset();
      // make our mock return different times each call
      mockGetCurrentTime
        .mockReturnValueOnce(1.23)
        .mockReturnValueOnce(2.34)
        .mockReturnValue(3.45);

      const onTime = vi.fn();
      render(<YouTubePlayer videoId="X" onTime={onTime} />);

      // no calls immediately
      expect(onTime).not.toHaveBeenCalled();

      // advance 250ms → 1 call
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(onTime).toHaveBeenCalledTimes(1);
      expect(onTime).toHaveBeenCalledWith(1.23);

      // another 500ms → 2 more calls
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onTime).toHaveBeenCalledTimes(3);
      expect(onTime).toHaveBeenNthCalledWith(2, 2.34);
      expect(onTime).toHaveBeenNthCalledWith(3, 3.45);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears its interval on unmount', () => {
    vi.useFakeTimers();
    try {
      const onTime = vi.fn();
      const { unmount } = render(<YouTubePlayer videoId="X" onTime={onTime} />);

      const spy = vi.spyOn(global, 'clearInterval');
      unmount();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });
});
