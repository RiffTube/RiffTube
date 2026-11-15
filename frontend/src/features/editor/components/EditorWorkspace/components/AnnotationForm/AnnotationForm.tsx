import { useEffect, useState } from 'react';
import { riffDuration, type Riff } from '@/features/riffs/types';

interface Props {
  riff: Riff;
  onChange: (changes: Partial<Riff>) => void;
}
function AnnotationForm({ riff, onChange }: Props) {
  const [text, setText] = useState(riff.text);
  const [bgColor, setBgColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');
  const [duration, setDuration] = useState(String(riffDuration(riff)));

  /* Synchronise when the parent selects a different riff */
  useEffect(() => {
    setText(riff.text);
    setDuration(String(riffDuration(riff)));
    // bgColor / textColor / fontSize would come from riff.styling later
  }, [riff]);

  useEffect(() => {
    const id = setTimeout(() => {
      // Report only what actually differs, so an untouched form stays quiet.
      // The riff stores start/end, so a duration edit moves `end`.
      const changes: Partial<Riff> = {};
      const seconds = Number(duration);
      if (text !== riff.text) changes.text = text;
      if (seconds !== riffDuration(riff)) changes.end = riff.start + seconds;
      // later: styling: { bgColor, textColor, fontSize: Number(fontSize) }
      if (Object.keys(changes).length > 0) onChange(changes);
    }, 300);

    return () => clearTimeout(id);
  }, [text, duration, riff, onChange]);

  return (
    <section className="space-y-4 rounded-lg bg-transparent p-4">
      <h3 className="font-medium">Add an annotation</h3>
      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type riff text that will appear over the video…"
        className="w-full max-w-full resize-none rounded-lg border-2 border-smoke bg-transparent p-2 text-sm xl:text-base"
      />
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
          <label className="mb-1 block text-xs">Duration&nbsp;(s)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={e => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= 3600) {
                setDuration(String(value));
              } else {
                setDuration('1'); // Default to 1 second if invalid
              }
            }}
            className="w-24 rounded bg-gray-900 p-2 text-center"
          />
        </div>
      </div>
    </section>
  );
}

export default AnnotationForm;
