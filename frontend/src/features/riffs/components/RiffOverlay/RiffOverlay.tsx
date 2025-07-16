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

function RiffOverlay({ riffs, currentTime }: Props) {
  return (
    <div className="pointer-events-none absolute bottom-10 w-full text-center">
      {riffs
        .filter(r => currentTime >= r.start && currentTime <= r.end)
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
