import { riffDuration, type Riff } from '@/features/riffs/types';
import type { TimingField } from '../../../../hooks/useRiffEditor';
import TimeField from '../TimeField';

interface Props {
  riff: Riff;
  /** Whether this riff shares screen time with another one */
  overlaps: boolean;
  /** Whether a timing change is still on its way to the server */
  isSaving: boolean;
  onChange: (changes: Partial<Pick<Riff, 'start' | 'end'>>) => boolean;
  onNudge: (field: TimingField, delta: number) => void;
  onSetIn: () => void;
  onSetOut: () => void;
}

const NUDGES = [-1, -0.1, 0.1, 1];

const nudgeButton =
  'h-9 min-w-10 cursor-pointer rounded-lg bg-reel-dust px-2 font-mono text-xs tabular-nums hover:bg-[#3a3a39] focus:ring-2 focus:ring-reel-dust/50 focus:outline-none';
const playheadButton =
  'h-9 cursor-pointer rounded-lg border border-white/20 px-3 text-xs hover:bg-white/5 focus:ring-2 focus:ring-white/20 focus:outline-none';

function nudgeLabel(edge: string, delta: number): string {
  const direction = delta < 0 ? 'earlier' : 'later';
  const amount =
    Math.abs(delta) === 1 ? '1 second' : `${Math.abs(delta)} seconds`;
  return `Move ${edge} ${amount} ${direction}`;
}

function TimingControls({
  riff,
  overlaps,
  isSaving,
  onChange,
  onNudge,
  onSetIn,
  onSetOut,
}: Props) {
  const rows = [
    {
      field: 'start' as const,
      label: 'Start',
      value: riff.start,
      onPlayhead: onSetIn,
      playheadLabel: 'Set start to playhead',
      shortcut: 'I',
    },
    {
      field: 'end' as const,
      label: 'End',
      value: riff.end,
      onPlayhead: onSetOut,
      playheadLabel: 'Set end to playhead',
      shortcut: 'O',
    },
  ];

  return (
    <section aria-label="Timing" className="space-y-3">
      {rows.map(row => (
        <div key={row.field} className="flex flex-wrap items-end gap-1.5">
          <TimeField
            // Keyed by riff so half-typed input never carries over to another
            // riff that happens to have the same time.
            key={riff.id}
            id={`riff-${row.field}`}
            label={row.label}
            value={row.value}
            onCommit={seconds => onChange({ [row.field]: seconds })}
          />

          {NUDGES.map(delta => (
            <button
              key={delta}
              type="button"
              aria-label={nudgeLabel(row.field, delta)}
              onClick={() => onNudge(row.field, delta)}
              className={nudgeButton}
            >
              {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
            </button>
          ))}

          <button
            type="button"
            aria-label={row.playheadLabel}
            title={row.playheadLabel}
            onClick={row.onPlayhead}
            className={playheadButton}
          >
            Playhead{' '}
            <kbd className="ml-1 rounded bg-white/10 px-1 font-mono">
              {row.shortcut}
            </kbd>
          </button>
        </div>
      ))}

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
        <span>
          Duration{' '}
          <span className="font-mono text-white tabular-nums">
            {riffDuration(riff).toFixed(1)}s
          </span>
        </span>
        <span role="status" className="text-xs">
          {isSaving ? 'Saving timing…' : 'Timing saved'}
        </span>
        {overlaps && (
          <span className="text-xs text-amber-300">
            ⚠ Overlaps another riff
          </span>
        )}
      </p>
    </section>
  );
}

export default TimingControls;
