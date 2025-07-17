export interface Riff {
  id: string;
  start: number;
  end: number;
  text: string;
}

interface Props {
  riffs: Riff[];
  currentTime: number;
}
const epsilon = 0.25; // quarters of a second

function RiffOverlay({ riffs, currentTime }: Props) {
  console.log(riffs, 'riffs');
  return (
    <div className="pointer-events-none absolute bottom-10 w-full text-center">
      {riffs
        .filter(
          r =>
            currentTime >= r.start - epsilon && currentTime <= r.end + epsilon,
        )
        .map(r => (
          <span
            key={r.id}
            className="inline-block rounded bg-black/70 px-4 py-1 text-white transition-opacity duration-200"
          >
            {r.text}
          </span>
        ))}
    </div>
  );
}

export default RiffOverlay;
