import Button from '@/components/Button'; // if you have a shared Button; else keep <button>
import TextInput from '@/components/TextInput';
import type { DummyRiff } from '../../../../data/dummyRiffs';

interface Props {
  riff: DummyRiff | null;
  onChange: (updated: DummyRiff) => void;
  onSave?: (changes: Partial<DummyRiff>) => void;
  onUndo: () => void;
  canSave: boolean;
}

function RiffControls({ riff, onChange, onSave, onUndo, canSave }: Props) {
  // If no riff is selected yet, just return null / skeleton
  if (!riff) return null;

  /** handlers write directly to parent draft */
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...riff, title: e.target.value });

  const handleSaveClick = () =>
    onSave?.({
      id: riff.id,
      title: riff.title,
      duration: riff.duration,
    });

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
      />

      {/* push buttons to the right */}
      <div className="flex-1" />

      {/* Undo */}
      <Button variant="secondary" onClick={onUndo}>
        Undo changes
      </Button>

      {/* Save */}
      <Button
        aria-label={canSave ? 'Save riff' : 'No changes to save'}
        disabled={!canSave}
        variant="lightMode"
        onClick={handleSaveClick}
      >
        Save
      </Button>
    </div>
  );
}
export default RiffControls;
