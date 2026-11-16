import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import type { Riff } from '@/features/riffs/types';

interface Props {
  riff: Riff;
  onChange: (changes: Pick<Riff, 'title'>) => void;
  onSave: () => void;
  onRevert: () => void;
  onDelete: () => void;
  /** Whether there are unsaved changes to the title, text or styling */
  isDirty: boolean;
  isSaving: boolean;
}

function RiffControls({
  riff,
  onChange,
  onSave,
  onRevert,
  onDelete,
  isDirty,
  isSaving,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Name field */}
      <TextInput
        id="riff-name"
        label="Name"
        value={riff.title}
        onChange={event => onChange({ title: event.target.value })}
        placeholder="Riff title"
        className="w-56"
      />

      {/* push buttons to the right */}
      <div className="flex-1" />

      <Button variant="secondary" onClick={onDelete}>
        Delete
      </Button>

      <Button variant="secondary" disabled={!isDirty} onClick={onRevert}>
        Undo changes
      </Button>

      <Button
        aria-label={isDirty ? 'Save riff' : 'No changes to save'}
        disabled={!isDirty}
        isLoading={isSaving}
        variant="lightMode"
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  );
}
export default RiffControls;
