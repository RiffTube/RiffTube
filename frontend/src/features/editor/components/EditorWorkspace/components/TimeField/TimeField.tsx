import { useEffect, useState, type KeyboardEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { fieldControl, fieldLabel } from '../../../../styles/fields';
import { formatTime, parseTime } from '../../../../utils/time';

interface Props {
  id: string;
  label: string;
  /** Seconds */
  value: number;
  /** Receives the typed time in seconds; return false to refuse it. */
  onCommit: (seconds: number) => boolean;
}

/** A time shown as mm:ss.s that can be typed over; it commits on Enter or blur. */
function TimeField({ id, label, value, onCommit }: Props) {
  const [text, setText] = useState(formatTime(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setText(formatTime(value));
    setInvalid(false);
  }, [value]);

  const restore = () => {
    setText(formatTime(value));
    setInvalid(false);
  };

  const commit = () => {
    const seconds = parseTime(text);
    if (seconds === null) {
      setInvalid(true);
      return;
    }
    // Refused or unchanged: show the time the riff really has.
    if (seconds === value || !onCommit(seconds)) restore();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      // Undo the typing here only; don't let Esc revert the whole riff.
      event.stopPropagation();
      restore();
    }
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={event => {
          setText(event.target.value);
          setInvalid(false);
        }}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={twMerge(
          'h-10 w-full px-2 text-center font-mono text-sm tabular-nums',
          fieldControl,
          invalid && 'border-red-400 hover:border-red-400 focus:border-red-400',
        )}
      />
      {invalid && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-300">
          Use mm:ss.s, like 01:23.4
        </p>
      )}
    </div>
  );
}

export default TimeField;
