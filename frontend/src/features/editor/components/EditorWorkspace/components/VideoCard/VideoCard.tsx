import { useState } from 'react';
import YouTubePlayer from '@/features/player/components/YouTubePlayer';
import RiffOverlay from '@/features/riffs/components/RiffOverlay';
import type { Riff } from '@/features/riffs/types';

interface Props {
  /** All riffs in this video */
  riffs: Riff[];
  /** The riff currently selected in the sidebar */
  selectedId: string | null;
  /** YouTube videoId for the project */
  videoId: string | null;
}

function VideoCard({ riffs, videoId }: Props) {
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div className="relative aspect-video max-h-[40vh] w-full overflow-hidden rounded-lg bg-black shadow-lg sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[60vh]">
      {videoId ? (
        <>
          {/* — YouTube player — */}
          <YouTubePlayer videoId={videoId} onTime={setCurrentTime} />

          {/* — Overlay riffs — */}
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
            <RiffOverlay riffs={riffs} currentTime={currentTime} />
          </div>
        </>
      ) : (
        <p className="flex h-full items-center justify-center text-sm text-white/60">
          This project has no video.
        </p>
      )}
    </div>
  );
}

export default VideoCard;
