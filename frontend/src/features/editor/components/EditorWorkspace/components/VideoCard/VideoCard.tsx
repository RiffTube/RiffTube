import { useState } from 'react';
import YouTubePlayer from '../../../../../player/components/YouTubePlayer';
import RiffOverlay from '../../../../../riffs/components/RiffOverlay';
import type { DummyRiff } from '../../../../data/dummyRiffs';

interface Props {
  /** All riffs in this video */
  riffs: DummyRiff[];
  /** The riff currently selected in the sidebar */
  selectedId: string | null;
  /** YouTube videoId for the project */
  videoId?: string; // optional so you can swap later
}

export default function VideoCard({
  riffs,
  selectedId,
  videoId = 'dQw4w9WgXcQ', // fallback to Rickroll for demo
}: Props) {
  const [currentTime, setCurrentTime] = useState(0);

  /** Map DummyRiff -> overlay shape */
  const overlayRiffs = riffs.map(r => ({
    id: r.id,
    start: r.start,
    end: r.start + r.duration,
    text: r.text ?? '', // Ensure text is always a string
    highlighted: r.id === selectedId,
  }));

  return (
    <div className="relative aspect-video h-[35vh] w-full overflow-hidden rounded-lg bg-black shadow-lg lg:h-[55vh]">
      {/* — YouTube player — */}
      <YouTubePlayer videoId={videoId} onTime={setCurrentTime} />

      {/* — Overlay riffs — */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
        <RiffOverlay riffs={overlayRiffs} currentTime={currentTime} />
      </div>
    </div>
  );
}
