import { ReactNode } from 'react'

import { BaseTextInput, BaseTextInputProps } from '../BaseTextInput/BaseTextInput.component'

export interface JsonInputProps extends Omit<BaseTextInputProps, 'onChange'> {
  onChange: (name: string, value: string | null) => void
}

export function JsonInput({ name, value, onChange, onBlur, ...props }: JsonInputProps): ReactNode {
  const handleChange = onChange
    ? (e: React.ChangeEvent<HTMLInputElement>): void => {
        onChange(name, e.target.value || null)
      }
    : undefined

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    let formattedValue = e.target.value

    try {
      formattedValue = JSON.stringify(JSON.parse(e.target.value), null, 2)
    } catch {
      // Do nothing
    }

    onChange(name, formattedValue || null)
    if (onBlur) onBlur(e)
  }

  return (
    <BaseTextInput
      {...props}
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
