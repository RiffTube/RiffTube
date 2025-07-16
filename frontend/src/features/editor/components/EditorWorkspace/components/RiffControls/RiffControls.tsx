import { useEffect, useState } from 'react';
import type { DummyRiff } from '../../../../data/dummyRiffs';

interface Props {
  riff: DummyRiff | null;
  onSave?: (changes: Partial<DummyRiff>) => void;
}

export default function RiffControls({ riff, onSave }: Props) {
  /* local draft state */
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');

  /* sync whenever a new riff is selected */
  useEffect(() => {
    if (!riff) return;
    setTitle(riff.title);
    setDuration(riff.duration.toString());
  }, [riff]);

  /* revert local edits */
  const handleUndo = () => {
    if (!riff) return;
    setTitle(riff.title);
    setDuration(riff.duration.toString());
  };

  /* save (bubble up) */
  const handleSave = () => {
    if (!riff) return;
    onSave?.({
      id: riff.id,
      title,
      duration: Number(duration),
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Title field */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs">Name</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-56 rounded bg-gray-800 px-3 py-2"
          placeholder="Riff title"
        />
      </div>

      {/* Duration field */}
      <div className="flex flex-col">
        <label className="mb-1 text-xs">Duration&nbsp;(s)</label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className="w-24 rounded bg-gray-800 px-3 py-2"
        />
      </div>

      {/* Spacer pushes buttons right on wide screens */}
      <div className="flex-1" />

      {/* Action buttons */}
      <button
        onClick={handleUndo}
        className="rounded bg-gray-700 px-4 py-2 transition hover:bg-gray-600"
      >
        Undo changes
      </button>
      <button
        onClick={handleSave}
        className="rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200"
      >
        Save
      </button>
    </div>
  );
}
