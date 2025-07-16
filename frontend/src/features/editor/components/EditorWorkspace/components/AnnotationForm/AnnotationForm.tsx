import { useEffect, useState } from 'react';
import type { DummyRiff } from '../../../../data/dummyRiffs';

interface Props {
  riff: DummyRiff | null;
  /** Optional callback so parent can persist changes later */
  onChange?: (updated: Partial<DummyRiff>) => void;
}

export default function AnnotationForm({ riff, onChange }: Props) {
  /* local editable fields */
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');
  const [duration, setDuration] = useState('8');

  /* sync initial values whenever riff prop changes */
  useEffect(() => {
    if (!riff) return;
    setText(riff.text ?? '');
    // bgColor, textColor, fontSize would come from riff.styling in the future
  }, [riff]);

  /* bubble up changes (debounced) */
  useEffect(() => {
    if (!onChange) return;
    const id = setTimeout(
      () =>
        onChange({
          text,
          duration: Number(duration),
          // store styling as an object later
        }),
      300,
    );
    return () => clearTimeout(id);
  }, [text, duration, onChange]);

  return (
    <section className="space-y-4 rounded-lg bg-gray-800 p-4">
      <h3 className="font-medium">Add an annotation</h3>

      {/* Text textarea */}
      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type riff text that will appear over the video…"
        className="w-full max-w-full resize-none rounded bg-gray-900 p-2 text-sm xl:text-base"
      />

      {/* Style + duration inputs */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs">Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={e => setBgColor(e.target.value)}
            className="h-8 w-12 border-0 p-0"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs">Text color</label>
          <input
            type="color"
            value={textColor}
            onChange={e => setTextColor(e.target.value)}
            className="h-8 w-12 border-0 p-0"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs">Font size</label>
          <select
            value={fontSize}
            onChange={e => setFontSize(e.target.value)}
            className="rounded bg-gray-900 p-2"
          >
            {[12, 14, 16, 18, 20, 24, 32].map(size => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs">Duration (s)</label>
          <input
            type="number"
            min="1"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-20 rounded bg-gray-900 p-2"
          />
        </div>
      </div>
    </section>
  );
}
