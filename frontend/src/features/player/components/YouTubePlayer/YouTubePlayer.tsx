import { useEffect, useRef } from 'react';
import YouTube, { YouTubePlayer as YT } from 'react-youtube';

interface Props {
  videoId: string;
  onTime: (t: number) => void;
}

function YouTubePlayer({ videoId, onTime }: Props) {
  const playerRef = useRef<YT | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        onTime(playerRef.current.getCurrentTime());
      }
    }, 250);
    return () => clearInterval(interval);
  }, [onTime]);

  return (
    <YouTube
      videoId={videoId}
      className="h-full w-full"
      onReady={e => (playerRef.current = e.target)}
      opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1 } }}
    />
  );
}

export default YouTubePlayer;
