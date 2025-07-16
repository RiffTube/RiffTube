import Button from '@/components/Button'; // if you have a shared Button; else keep <button>
import TextInput from '@/components/TextInput';
import type { DummyRiff } from '../../../../data/dummyRiffs';

interface Props {
  riff: DummyRiff | null;
  onChange: (updated: DummyRiff) => void;
  onSave?: (changes: Partial<DummyRiff>) => void;
  onUndo: () => void;
}

export default function RiffControls({
  riff,
  onChange,
  onSave,
  onUndo,
}: Props) {
  // If no riff is selected yet, just return null / skeleton
  if (!riff) return null;

  /** handlers write directly to parent draft */
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...riff, title: e.target.value });

  /** Save delegates to parent + backend */
  const handleSave = () =>
    onSave?.({ id: riff.id, title: riff.title, duration: riff.duration });

  return (
    <div className="flex flex-wrap items-end gap-6">
      {/* Name field */}
      <TextInput
        id="riff-name"
        label="Name"
        value={riff.title}
        onChange={handleTitle}
        placeholder="Riff title"
        required
        className="w-56"
      />

      {/* Duration field (read‑only) */}
      <TextInput
        id="riff-duration"
        label="Duration (s)"
        value={String(riff.duration)}
        readOnly
        size="sm"
        className="w-24 cursor-default text-center"
      />

      {/* push buttons to the right */}
      <div className="flex-1" />

      {/* Undo */}
      <Button variant="secondary" onClick={onUndo}>
        Undo changes
      </Button>

      {/* Save */}
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}
