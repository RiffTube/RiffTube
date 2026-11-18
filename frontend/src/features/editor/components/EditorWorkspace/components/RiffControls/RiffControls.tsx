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
  /** Locks the name and the buttons, e.g. while an older version is restored */
  disabled?: boolean;
}

function RiffControls({
  riff,
  onChange,
  onSave,
  onRevert,
  onDelete,
  isDirty,
  isSaving,
  disabled = false,
}: Props) {
  return (
    <div>
      <TextInput
        id="riff-name"
        label="Name"
        value={riff.title}
        onChange={event => onChange({ title: event.target.value })}
        placeholder="Riff title"
        className="w-full"
        disabled={disabled}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" disabled={disabled} onClick={onDelete}>
          Delete
        </Button>

        {/* push the save buttons to the right */}
        <div className="flex-1" />

        <Button
          variant="secondary"
          disabled={disabled || !isDirty}
          onClick={onRevert}
        >
          Undo changes
        </Button>

        <Button
          aria-label={isDirty ? 'Save riff' : 'No changes to save'}
          disabled={disabled || !isDirty}
          isLoading={isSaving}
          variant="lightMode"
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
export default RiffControls;
