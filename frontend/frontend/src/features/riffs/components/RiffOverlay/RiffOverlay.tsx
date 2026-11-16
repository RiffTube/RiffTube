import type { CSSProperties } from 'react';
import type { Riff } from '../../types';

type OverlayRiff = Pick<Riff, 'id' | 'start' | 'end' | 'text'> &
  Partial<Pick<Riff, 'styling'>>;

interface Props {
  riffs: OverlayRiff[];
  currentTime: number;
}
const epsilon = 0.25; // quarters of a second

/** Only what the riff sets itself; anything else keeps the default look. */
function inlineStyle(styling: Riff['styling'] | undefined): CSSProperties {
  const { bgColor, textColor, fontSize } = styling ?? {};
  const style: CSSProperties = {};
  if (typeof bgColor === 'string') style.backgroundColor = bgColor;
  if (typeof textColor === 'string') style.color = textColor;
  if (typeof fontSize === 'number' && fontSize > 0) style.fontSize = fontSize;
  return style;
}

function RiffOverlay({ riffs, currentTime }: Props) {
  return (
    <div className="pointer-events-none absolute bottom-10 w-full text-center">
      {riffs
        .filter(
          r =>
            r.text.trim() !== '' &&
            currentTime >= r.start - epsilon &&
            currentTime <= r.end + epsilon,
        )
        .map(r => (
          <span
            key={r.id}
            style={inlineStyle(r.styling)}
            className="inline-block rounded bg-black/70 px-4 py-1 text-white transition-opacity duration-200"
          >
            {r.text}
          </span>
        ))}
    </div>
  );
}

export default RiffOverlay;
