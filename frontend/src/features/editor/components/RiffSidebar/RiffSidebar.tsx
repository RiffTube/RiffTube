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
    <aside className="hidden w-64 shrink-0 space-y-4 overflow-y-auto p-4 xl:block">
      <Logo size="md" />
      {riffs.length === 0 && (
        <p className="text-sm text-gray-400">No riffs yet.</p>
      )}
      <ul className="space-y-2">
        {riffs.map(r => {
          const isActive = r.id === selectedId;
          return (
            <li key={r.id}>
              <button
                type="button"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelect(r.id)}
                className={`w-full cursor-pointer rounded-2xl border-2 p-2 text-left transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none ${
                  isActive ? 'border-white' : 'border-transparent'
                }`}
              >
                <span className="block truncate font-medium">
                  {r.title || r.text || 'Untitled riff'}
                </span>
                <span className="block font-mono text-xs text-gray-400 tabular-nums">
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
