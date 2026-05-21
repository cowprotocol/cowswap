import { ReactNode } from 'react'

import { BaseTextInput, BaseTextInputProps } from '../BaseTextInput/BaseTextInput.component'

export interface NumberInputProps extends Omit<BaseTextInputProps, 'onChange' | 'value' | 'type'> {
  name: string
  value: number | null | undefined
  onChange: (name: string, value: number | null | undefined) => void
  emptyValue?: number | null | undefined
  parseValue?: (value: string) => number | null | undefined
}

export function NumberInput({
  name,
  value,
  onChange,
  onBlur,
  emptyValue = undefined,
  parseValue,
  ...props
}: NumberInputProps): ReactNode {
  const parseNumberValue = (rawValue: string): number | null | undefined => {
    if (rawValue === '') {
      return emptyValue
    }

    if (parseValue) {
      return parseValue(rawValue)
    }

    const numericValue = Number(rawValue)
    return Number.isNaN(numericValue) ? emptyValue : numericValue
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(name, parseNumberValue(event.target.value))
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    onChange(name, parseNumberValue(event.target.value))
    if (onBlur) onBlur(event)
  }

  return (
    <BaseTextInput
      {...props}
      type="number"
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}
