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

/*
 * Start, End and Duration share one column template, so the time values,
 * each nudge button and the playhead actions line up from row to row.
 * On narrow screens the playhead action drops to its own line.
 */
const row =
  'grid grid-cols-[6.5rem_repeat(4,minmax(2.25rem,1fr))] items-end gap-1.5 ' +
  'sm:grid-cols-[6.5rem_repeat(4,minmax(2.25rem,1fr))_6.75rem]';

const nudgeButton =
  'h-10 cursor-pointer rounded-[6px] border border-strong-outline bg-surface-3 px-1 font-mono text-xs text-paper tabular-nums ' +
  'transition-colors hover:border-smoke hover:bg-[#363236]';
const playheadButton =
  'col-span-full inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-strong-outline px-2 text-xs text-paper ' +
  'transition-colors hover:border-smoke hover:bg-white/5 sm:col-span-1';

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
      {rows.map(row_ => (
        <div key={row_.field} className={row}>
          <TimeField
            // Keyed by riff so half-typed input never carries over to another
            // riff that happens to have the same time.
            key={riff.id}
            id={`riff-${row_.field}`}
            label={row_.label}
            value={row_.value}
            onCommit={seconds => onChange({ [row_.field]: seconds })}
          />

          {NUDGES.map(delta => (
            <button
              key={delta}
              type="button"
              aria-label={nudgeLabel(row_.field, delta)}
              onClick={() => onNudge(row_.field, delta)}
              className={nudgeButton}
            >
              {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
            </button>
          ))}

          <button
            type="button"
            aria-label={row_.playheadLabel}
            title={row_.playheadLabel}
            onClick={row_.onPlayhead}
            className={playheadButton}
          >
            Playhead{' '}
            <kbd className="rounded-[3px] bg-white/10 px-1 font-mono text-muted-dark">
              {row_.shortcut}
            </kbd>
          </button>
        </div>
      ))}

      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-rule-dark pt-3 text-sm text-muted-dark">
        <span className="w-[6.5rem]">
          Duration{' '}
          <span className="font-mono text-paper tabular-nums">
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
