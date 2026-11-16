import { forwardRef, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type Size = 'sm' | 'md' | 'lg';
export type TextInputProps = {
  id: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  pattern?: string;
  errorMessage?: string;
  infoMessage?: string;
  forceShowError?: boolean;
  className?: string;
  size?: Size;
  disabled?: boolean;
  isLoading?: boolean;
  readOnly?: boolean;
};

const sizeClassesMap: Record<Size, string> = {
  sm: 'text-sm px-3 pt-4 pb-2',
  md: 'text-base px-4 pt-6 pb-3',
  lg: 'text-lg px-5 pt-7 pb-4',
};

function TextInput(
  {
    id,
    label,
    value,
    onChange,
    defaultValue = '',
    placeholder = '',
    type = 'text',
    required = false,
    pattern,
    errorMessage,
    infoMessage,
    forceShowError = false,
    className = '',
    size = 'md',
    disabled = false,
    isLoading = false,
    readOnly = false,
  }: TextInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const validity = inputRef.current?.validity;
  const nativeInvalid = validity ? !validity.valid : false;

  const shouldShow = forceShowError || touched;

  const showError = forceShowError || (shouldShow && nativeInvalid);
  const showInfo = isFocused && !showError;

  const describedBy = showError ? `${id}-error` : undefined;

  const labelClasses =
    'pointer-events-none absolute top-2 left-4 text-xs font-medium text-silver-dust';

  const inputClasses = twMerge(
    'peer block w-full rounded-2xl border-2 border-smoke bg-transparent placeholder-gray-600 transition focus:border-silver-dust focus:ring-4 focus:ring-silver-dust/50 focus:outline-none invalid:focus:border-red-500 invalid:focus:ring-red-500/50 disabled:cursor-not-allowed disabled:bg-[#333333] disabled:text-[#aaaaaa] disabled:opacity-40',
    readOnly ? 'border-0 border-none cursor-default focus:ring-0 ' : '',
    sizeClassesMap[size],

    className,
  );

  return (
    <div className="relative">
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && ' *'}
      </label>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type={type}
        {...(value !== undefined
          ? { value, onChange }
          : { defaultValue, onChange })}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setTouched(true);
        }}
        aria-invalid={showError}
        aria-describedby={describedBy}
        className={inputClasses}
        disabled={disabled || isLoading}
        readOnly={readOnly}
      />

      <div className="mt-1 ml-1 h-5">
        {showError && (
          <p id={`${id}-error`} className="text-xs text-red-500">
            {errorMessage ?? 'Invalid value'}
          </p>
        )}
        {showInfo && <p className="text-[0.6rem] sm:text-xs">{infoMessage}</p>}
      </div>
    </div>
  );
}

TextInput.displayName = 'TextInput';

export default forwardRef(TextInput);
