import Button from '@/components/Button'; // if you have a shared Button; else keep <button>
import TextInput from '@/components/TextInput';
import { riffDuration, type Riff } from '@/features/riffs/types';

interface Props {
  riff: Riff | null;
  onChange: (updated: Riff) => void;
  onSave?: (changes: Partial<Riff>) => void;
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

      {/* Duration field (read‑only, derived from start/end) */}
      <TextInput
        id="riff-duration"
        label="Duration (s)"
        value={String(riffDuration(riff))}
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
