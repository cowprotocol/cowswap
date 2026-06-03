import { ReactNode } from 'react'

import { InputAdornment } from '@mui/material'
import Box from '@mui/material/Box'

import { numberInputUnitAdornedSx, numberInputUnitTypographySx } from './NumberInput.styles'

import { BaseTextInput, BaseTextInputProps } from '../BaseTextInput/BaseTextInput.component'

export interface NumberInputProps extends Omit<BaseTextInputProps, 'onChange' | 'value' | 'type'> {
  name: string
  value: number | null | undefined
  onChange: (name: string, value: number | null | undefined) => void
  emptyValue?: number | null | undefined
  parseValue?: (value: string) => number | null | undefined
  /** Unit label rendered on the right inside the field (e.g. "BPS", "min"). */
  unit?: string
}

export function NumberInput({
  name,
  value,
  onChange,
  onBlur,
  emptyValue = undefined,
  parseValue,
  unit,
  InputProps,
  sx,
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

  const resolvedSx = Array.isArray(sx) ? sx : sx ? [sx] : []
  const unitAdornedSx = unit ? [numberInputUnitAdornedSx] : []

  return (
    <BaseTextInput
      {...props}
      type="number"
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      sx={[...unitAdornedSx, ...resolvedSx]}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <>
            {InputProps?.endAdornment}
            {unit ? (
              <InputAdornment position="end">
                <Box component="span" sx={numberInputUnitTypographySx}>
                  {unit}
                </Box>
              </InputAdornment>
            ) : null}
          </>
        ),
      }}
    />
  )
}
