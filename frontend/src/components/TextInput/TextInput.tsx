import React, { forwardRef, useRef, useState } from 'react';

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
  }: TextInputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const nativeInvalid = inputRef.current
    ? !inputRef.current.validity.valid
    : false;

  // Only show errors after the user has blurred the field (touched) … unless forced.
  const shouldShow = forceShowError || touched;

  const showError = shouldShow && (Boolean(errorMessage) || nativeInvalid);
  const showInfo = isFocused && !showError;

  const describedBy = showError ? `${id}-error` : undefined;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-2 left-4 text-xs font-medium text-silver-dust"
      >
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
        className="peer block w-full rounded-2xl border-2 border-smoke bg-transparent px-4 pt-6 pb-3 text-white placeholder-gray-600 transition focus:border-silver-dust focus:ring-4 focus:ring-silver-dust/50 focus:outline-none invalid:focus:border-red-500 invalid:focus:ring-red-500/50"
      />

      <div className="mt-1 ml-1 h-5">
        {showError && (
          <p id={`${id}-error`} className="text-xs text-red-500">
            {errorMessage ?? 'Invalid value'}
          </p>
        )}
        {showInfo && <p className="text-xs text-white">{infoMessage}</p>}
      </div>
    </div>
  );
}

TextInput.displayName = 'TextInput';

export default forwardRef(TextInput);
