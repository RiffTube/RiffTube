import { FieldError } from 'react-hook-form';
import TextInput, { TextInputProps } from '@/components/TextInput';

type AuthFieldProps = Omit<TextInputProps, 'errorMessage' | 'infoMessage'> & {
  label: string;
  error?: FieldError;
};

function AuthField(props: AuthFieldProps) {
  const { id, label, error, value, onChange, ...rest } = props;

  return (
    <div className="mb-4">
      <TextInput
        id={id}
        label={label}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
        errorMessage={error?.message}
        {...rest}
      />
    </div>
  );
}

export default AuthField;
