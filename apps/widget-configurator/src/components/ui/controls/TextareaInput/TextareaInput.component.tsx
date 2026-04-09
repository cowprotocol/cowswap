import { BaseTextInput, BaseTextInputProps } from "../BaseTextInput/BaseTextInput.component";
import { ReactNode } from "react";

export interface TextareaInputProps extends Omit<BaseTextInputProps, "onChange"> {
  onChange: (name: string, value: string | null) => void;
}

export function TextareaInput({
  name,
  value,
  onChange,
  onBlur,
  ...props
}: TextareaInputProps): ReactNode {
  const handleChange = onChange ? (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(name, e.target.value || null);
  } : undefined;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    onChange(name, e.target.value.trim() || null);
    if (onBlur) onBlur(e);
  }

  return (
    <BaseTextInput
      { ...props }
      sx={{ resize: 'vertical', ...props.sx }}
      name={name}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      multiline
      minRows={4}
    />
  )
}
