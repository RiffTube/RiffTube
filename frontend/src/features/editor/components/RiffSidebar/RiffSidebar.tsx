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
    <aside className="hidden w-64 space-y-4 overflow-y-auto border-r border-gray-700 p-4 xl:block">
      <h2 className="text-xl font-semibold">Riffs in this video</h2>

      <ul className="space-y-2">
        {riffs.map(r => {
          const isActive = r.id === selectedId;
          return (
            <li
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`flex cursor-pointer items-center rounded p-2 transition ${isActive ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
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
