import YouTubePlayer from '@/features/player/components/YouTubePlayer';
import { usePlayerController, usePlayerTime } from '@/features/player/context';
import RiffOverlay from '@/features/riffs/components/RiffOverlay';
import type { Riff } from '@/features/riffs/types';

interface Props {
  /** The riffs to show over the video, unsaved edits included */
  riffs: Riff[];
  /** YouTube videoId for the project */
  videoId: string | null;
}

function VideoCard({ riffs, videoId }: Props) {
  const player = usePlayerController();
  const currentTime = usePlayerTime();

  return (
    // Beside the panels (lg+) the video takes whatever room its column has
    // left, as large as fits at 16:9. Stacked, it stays under 40% of the
    // screen height so the panels below it are still in view.
    <div className="flex w-full items-start justify-center lg:[container-type:size] lg:aspect-video lg:min-h-0 lg:shrink lg:justify-start">
      <div className="relative aspect-video w-full max-w-[calc(40vh*16/9)] overflow-hidden rounded-lg bg-black shadow-lg lg:w-[min(100cqw,calc(100cqh*16/9))] lg:max-w-none">
        {videoId ? (
          <>
            {/* — YouTube player — */}
            <YouTubePlayer
              videoId={videoId}
              onTime={player.reportTime}
              onPlayer={player.register}
            />

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
    </div>
  );
}

export default VideoCard;
