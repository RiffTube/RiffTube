import { useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer as YT } from 'react-youtube';

interface Props {
  videoId: string;
  onTime: (t: number) => void;
  /** Receives the player once it can be controlled, and null when it goes away. */
  onPlayer?: (player: YT | null) => void;
}

const POLLING_INTERVAL_MS = 250; // poll the player every 250ms i.e. 4 times per second
function YouTubePlayer({ videoId, onTime, onPlayer }: Props) {
  const playerRef = useRef<YT | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        onTime(playerRef.current.getCurrentTime());
      }
    }, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [onTime]);

  useEffect(() => {
    return () => onPlayer?.(null);
  }, [onPlayer]);

  return (
    <YouTube
      videoId={videoId}
      className="h-full w-full"
      onReady={e => {
        playerRef.current = e.target;
        onPlayer?.(e.target);
      }}
      opts={{ width: '100%', height: '100%' }}
    />
  );
}

export default YouTubePlayer;
