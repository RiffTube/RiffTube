import Logo from '@/components/Logo';
import type { Riff } from '@/features/riffs/types';
import { formatTime } from '../../utils/time';

interface Props {
  riffs: Riff[];
  selectedId: string | null;
  /** Riffs that share screen time with another one */
  overlappingIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
}

function RiffSidebar({ riffs, selectedId, overlappingIds, onSelect }: Props) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-6 overflow-y-auto border-r border-rule-dark p-4 xl:block">
      <Logo size="sm" className="justify-start pt-1.5 pl-1 md:justify-start" />
      {riffs.length === 0 && (
        <p className="text-sm text-muted-dark">No riffs yet.</p>
      )}
      <ul className="space-y-1">
        {riffs.map(r => {
          const isActive = r.id === selectedId;
          return (
            <li key={r.id}>
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(r.id)}
                // Selection: charcoal fill + slim gold bar on the left.
                // Keyboard focus: the global full outline, so the two can be
                // told apart (and seen together on the selected riff).
                className={`w-full cursor-pointer rounded-[6px] py-2 pr-2 pl-3 text-left transition-colors ${
                  isActive
                    ? 'bg-charcoal shadow-[inset_3px_0_0_var(--color-gold)]'
                    : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`block truncate ${isActive ? 'font-semibold text-paper' : 'font-medium text-paper/90'}`}
                >
                  {r.title || r.text || 'Untitled riff'}
                </span>
                <span className="mt-0.5 block font-mono text-xs text-muted-dark tabular-nums">
                  {formatTime(r.start)} – {formatTime(r.end)}
                </span>
                {overlappingIds.has(r.id) && (
                  <span className="block text-xs text-amber-300">
                    ⚠ Overlaps
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
export default RiffSidebar;
