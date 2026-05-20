import { BaseTextInput, BaseTextInputProps } from "../BaseTextInput/BaseTextInput.component";
import { ReactNode } from "react";

export interface TextInputProps extends Omit<BaseTextInputProps, "onChange"> {
  onChange: (name: string, value: string | null) => void;
}

export function TextInput({
  name,
  value,
  onChange,
  onBlur,
  ...props
}: TextInputProps): ReactNode {
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
      name={name}
      value={value || ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
