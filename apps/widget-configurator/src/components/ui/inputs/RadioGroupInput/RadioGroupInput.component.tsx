import type { ChangeEvent, ReactNode } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'

import { HelpTooltipButton } from '../../HelpTooltipButton/HelpTooltipButton'

import type { PrimitiveValue, SelectInputOption } from '../Select/base/BaseSelectInput.types'

export interface RadioGroupInputProps<TValue extends PrimitiveValue = string> {
  name: string
  label: string
  value: TValue
  options: readonly SelectInputOption<TValue>[]
  onChange: (name: string, value: TValue) => void
  disabled?: boolean
  helperText?: ReactNode
  row?: boolean
  tooltip?: ReactNode
  tooltipAriaLabel?: string
}

function optionValueToString(value: PrimitiveValue): string {
  return String(value)
}

function parseSelectedValue<TValue extends PrimitiveValue>(
  rawValue: string,
  options: readonly SelectInputOption<TValue>[],
): TValue {
  const matchedOption = options.find((option) => optionValueToString(option.value) === rawValue)

  if (matchedOption) {
    return matchedOption.value
  }

  return rawValue as TValue
}

export function RadioGroupInput<TValue extends PrimitiveValue = string>({
  name,
  label,
  value,
  options,
  onChange,
  disabled = false,
  helperText,
  row = true,
  tooltip,
  tooltipAriaLabel,
}: RadioGroupInputProps<TValue>): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(name, parseSelectedValue(event.target.value, options))
  }

  return (
    <FormControl component="fieldset" disabled={disabled}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <FormLabel component="legend" sx={{ mb: 0 }}>
          {label}
        </FormLabel>
        {tooltip ? <HelpTooltipButton ariaLabel={tooltipAriaLabel ?? label} tooltip={tooltip} /> : null}
      </Box>
      <RadioGroup row={row} aria-label={label} name={name} value={optionValueToString(value)} onChange={handleChange}>
        {options.map((option) => (
          <FormControlLabel
            key={optionValueToString(option.value)}
            value={optionValueToString(option.value)}
            disabled={option.disabled}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText ? (
        <Typography sx={{ marginTop: '0.4rem', color: 'text.secondary', display: 'block' }} variant="caption">
          {helperText}
        </Typography>
      ) : null}
    </FormControl>
  )
}
