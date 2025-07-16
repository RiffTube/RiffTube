import Logo from '@/components/Logo';

export interface SidebarRiff {
  id: string;
  title: string;
  thumbnail: string; // path or URL
  start: number; // seconds
  duration: number; // seconds
}

interface Props {
  riffs: SidebarRiff[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function secondsToTimestamp(secs: number) {
  const mm = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

function RiffSidebar({ riffs, selectedId, onSelect }: Props) {
  return (
    <aside className="hidden w-64 space-y-4 overflow-y-auto p-4 xl:block">
      <Logo size="md" />
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
              <img
                src={r.thumbnail}
                alt=""
                className="h-10 w-14 flex-shrink-0 rounded object-cover"
              />

              <div className="ml-3 flex-1 overflow-hidden">
                <div className="truncate font-medium">{r.title}</div>
                <div className="text-xs text-gray-400">
                  {secondsToTimestamp(r.start)} &bull;{r.duration.toFixed(0)}s
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
