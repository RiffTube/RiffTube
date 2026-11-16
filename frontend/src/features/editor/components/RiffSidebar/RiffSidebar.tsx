import Logo from '@/components/Logo';
import { riffDuration, type Riff } from '@/features/riffs/types';
import { secondsToTimestamp } from '../../utils/time';

interface Props {
  riffs: Riff[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function RiffSidebar({ riffs, selectedId, onSelect }: Props) {
  return (
    <aside className="hidden w-64 space-y-4 overflow-y-auto p-4 xl:block">
      <Logo size="md" />
      {riffs.length === 0 && (
        <p className="text-sm text-gray-400">No riffs yet.</p>
      )}
      <ul className="space-y-2">
        {riffs.map(r => {
          const isActive = r.id === selectedId;
          return (
            <li
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 p-2 transition-colors ${
                isActive ? 'border-white' : 'border-transparent'
              }`}
            >
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium">
                  {r.title || r.text || 'Untitled riff'}
                </div>
                <div className="text-xs text-gray-400">
                  {secondsToTimestamp(r.start)} &bull;
                  {riffDuration(r).toFixed(0)}s
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
export default RiffSidebar;
