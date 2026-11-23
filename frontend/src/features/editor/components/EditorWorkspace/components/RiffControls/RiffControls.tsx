import Button from '@/components/Button';
import type { Riff } from '@/features/riffs/types';
import { fieldControl, fieldLabel } from '../../../../styles/fields';

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
    <div className="space-y-4">
      <div>
        <label htmlFor="riff-name" className={fieldLabel}>
          Name
        </label>
        <input
          id="riff-name"
          type="text"
          value={riff.title}
          onChange={event => onChange({ title: event.target.value })}
          placeholder="Riff title"
          disabled={disabled}
          className={`h-11 w-full px-3 text-base ${fieldControl}`}
        />
      </div>

      {/* Save leads; Undo is secondary; Delete is a quiet, separate choice. */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 hover:text-[#f0a39c]"
          disabled={disabled}
          onClick={onDelete}
        >
          Delete
        </Button>

        {/* push the save buttons to the right */}
        <div className="flex-1" />

        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || !isDirty}
          onClick={onRevert}
        >
          Undo changes
        </Button>

        <Button
          aria-label={isDirty ? 'Save riff' : 'No changes to save'}
          size="sm"
          className="min-w-20"
          disabled={disabled || !isDirty}
          isLoading={isSaving}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
export default RiffControls;
