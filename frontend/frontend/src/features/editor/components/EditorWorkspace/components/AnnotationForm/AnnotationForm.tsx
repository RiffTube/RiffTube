import type { Ref } from 'react';
import {
  overlayStyle,
  type Riff,
  type RiffContent,
} from '@/features/riffs/types';

interface Props {
  /** The riff being edited, unsaved changes included */
  riff: Riff;
  onChange: (changes: Partial<RiffContent>) => void;
  /** Lets the editor put the cursor in the text box after adding a riff */
  textRef?: Ref<HTMLTextAreaElement>;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32];

/** The riff's words and how they look. Every change is reported as it happens. */
function AnnotationForm({ riff, onChange, textRef }: Props) {
  const style = overlayStyle(riff.styling);
  const changeStyle = (changes: Partial<typeof style>) =>
    onChange({ styling: { ...riff.styling, ...changes } });

  return (
    <section className="space-y-4 rounded-lg bg-transparent">
      <div>
        <label htmlFor="riff-text" className="mb-1 block font-medium">
          Riff text
        </label>
        <textarea
          id="riff-text"
          ref={textRef}
          rows={4}
          value={riff.text}
          onChange={event => onChange({ text: event.target.value })}
          placeholder="Type riff text that will appear over the video…"
          className="w-full max-w-full resize-none rounded-lg border-2 border-smoke bg-transparent p-2 text-sm focus:border-white focus:outline-none xl:text-base"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="riff-bg-color" className="mb-1 block text-xs">
            Background
          </label>
          <input
            id="riff-bg-color"
            type="color"
            value={style.bgColor}
            onChange={event => changeStyle({ bgColor: event.target.value })}
            className="h-8 w-12 border-0 p-0"
          />
        </div>
        <div>
          <label htmlFor="riff-text-color" className="mb-1 block text-xs">
            Text color
          </label>
          <input
            id="riff-text-color"
            type="color"
            value={style.textColor}
            onChange={event => changeStyle({ textColor: event.target.value })}
            className="h-8 w-12 border-0 p-0"
          />
        </div>
        <div>
          <label htmlFor="riff-font-size" className="mb-1 block text-xs">
            Font size
          </label>
          <select
            id="riff-font-size"
            value={style.fontSize}
            onChange={event =>
              changeStyle({ fontSize: Number(event.target.value) })
            }
            className="rounded bg-gray-900 p-2"
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
