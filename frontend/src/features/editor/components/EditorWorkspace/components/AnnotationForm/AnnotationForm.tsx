import type { Ref } from 'react';
import {
  overlayStyle,
  type Riff,
  type RiffContent,
} from '@/features/riffs/types';
import { fieldControl, fieldLabel } from '../../../../styles/fields';

interface Props {
  /** The riff being edited, unsaved changes included */
  riff: Riff;
  onChange: (changes: Partial<RiffContent>) => void;
  /** Lets the editor put the cursor in the text box after adding a riff */
  textRef?: Ref<HTMLTextAreaElement>;
  /** Locks every field, e.g. while an older version is restored */
  disabled?: boolean;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32];

/** The riff's words and how they look. Every change is reported as it happens. */
function AnnotationForm({ riff, onChange, textRef, disabled = false }: Props) {
  const style = overlayStyle(riff.styling);
  const changeStyle = (changes: Partial<typeof style>) =>
    onChange({ styling: { ...riff.styling, ...changes } });

  return (
    <section className="space-y-4">
      <div>
        <label htmlFor="riff-text" className={fieldLabel}>
          Riff text
        </label>
        <textarea
          id="riff-text"
          ref={textRef}
          rows={4}
          value={riff.text}
          disabled={disabled}
          onChange={event => onChange({ text: event.target.value })}
          placeholder="Type riff text that will appear over the video…"
          className={`block w-full max-w-full resize-none px-3 py-2 text-base leading-relaxed ${fieldControl}`}
        />
      </div>
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <label htmlFor="riff-bg-color" className={fieldLabel}>
            Background
          </label>
          <input
            id="riff-bg-color"
            type="color"
            value={style.bgColor}
            disabled={disabled}
            onChange={event => changeStyle({ bgColor: event.target.value })}
            className="h-10 w-14 cursor-pointer rounded-[6px] border border-smoke bg-ink p-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="riff-text-color" className={fieldLabel}>
            Text color
          </label>
          <input
            id="riff-text-color"
            type="color"
            value={style.textColor}
            disabled={disabled}
            onChange={event => changeStyle({ textColor: event.target.value })}
            className="h-10 w-14 cursor-pointer rounded-[6px] border border-smoke bg-ink p-1 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="riff-font-size" className={fieldLabel}>
            Font size
          </label>
          <select
            id="riff-font-size"
            value={style.fontSize}
            disabled={disabled}
            onChange={event =>
              changeStyle({ fontSize: Number(event.target.value) })
            }
            className={`h-10 cursor-pointer pr-2 pl-3 text-sm tabular-nums ${fieldControl}`}
          >
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default AnnotationForm;
