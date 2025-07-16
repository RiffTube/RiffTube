import { useState } from 'react';

interface Revision {
  id: string;
  label: string;
}

/** Dummy revisions until the backend is wired */
const dummyRevisions: Revision[] = [
  { id: 'current', label: 'Current' },
  { id: 'rev1', label: 'Today, 11:02 AM' },
  { id: 'rev2', label: 'Today, 11:01 AM' },
];

interface Props {
  /** optional callback when a revision is selected */
  onSelect?: (revisionId: string) => void;
}

export default function RevisionPanel({ onSelect }: Props) {
  const [selected, setSelected] = useState<string>('current');

  const revisions = dummyRevisions; // replace with riff?.revisions later

  const handleChange = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <details className="text-sm" open={false}>
      <summary className="cursor-pointer py-2 font-medium select-none">
        Advanced options
      </summary>

      <div className="mt-3 space-y-2 pl-2">
        <h4 className="text-xs tracking-wider text-gray-400 uppercase">
          Revision history
        </h4>

        {revisions.map(rev => (
          <label
            key={rev.id}
            className="flex cursor-pointer items-center space-x-2"
          >
            <input
              type="radio"
              name="revision"
              checked={selected === rev.id}
              onChange={() => handleChange(rev.id)}
              className="accent-blue-500"
            />
            <span>{rev.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}
