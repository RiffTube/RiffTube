import { useEffect, useState } from 'react';

export interface Revision {
  id: string;
  label: string;
}

interface Props {
  /** The riff whose revisions you want to show */
  riff: { id: string; revisions?: Revision[] } | null;
  /** Optional callback when a revision is selected */
  onSelect?: (revisionId: string) => void;
}

function RevisionPanel({ riff, onSelect }: Props) {
  /* Reset the selected radio when the riff changes */
  const [selected, setSelected] = useState('current');
  useEffect(() => setSelected('current'), [riff?.id]);

  /* Fall back to a single "Current" entry if the riff has no revisions yet */
  const revisions: Revision[] = riff?.revisions?.length
    ? [{ id: 'current', label: 'Current' }, ...riff.revisions]
    : [{ id: 'current', label: 'Current' }];

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
              name={`revision-${riff?.id ?? 'none'}`}
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

export default RevisionPanel;
