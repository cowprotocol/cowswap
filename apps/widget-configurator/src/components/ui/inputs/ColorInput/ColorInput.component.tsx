import { type FocusEvent, type ReactNode, useCallback, useEffect, useState } from 'react'

import { useThrottleFn } from '@cowprotocol/common-hooks'

import { MuiColorInput, type MuiColorInputFormat } from 'mui-color-input'

import { colorInputAdornedInputSx, colorInputPopoverProps } from './ColorInput.styles'

import { BaseTextInputProps } from '../BaseTextInput/BaseTextInput.component'
import { baseTextInputSx } from '../BaseTextInput/BaseTextInput.styles'

const DEFAULT_THROTTLE_MS = 100

export interface ColorInputProps extends Omit<BaseTextInputProps, 'onChange' | 'value' | 'type'> {
  value: string
  onChange: (name: string, value: string) => void
  format?: MuiColorInputFormat
  isAlphaHidden?: boolean
  throttleMs?: number
}

export function ColorInput({
  name,
  value,
  onChange,
  onBlur,
  format = 'hex',
  isAlphaHidden = true,
  throttleMs = DEFAULT_THROTTLE_MS,
  sx,
  ...props
}: ColorInputProps): ReactNode {
  const [localValue, setLocalValue] = useState(value)
  const resolvedSx = Array.isArray(sx) ? sx : sx ? [sx] : []

  const emitChange = useCallback(
    (fieldName: string, newValue: string) => {
      onChange(fieldName, newValue)
    },
    [onChange],
  )
  const throttledEmitChange = useThrottleFn(emitChange, throttleMs)

  useEffect(() => {
    setLocalValue((currentValue) => (currentValue === value ? currentValue : value))
  }, [value])

  const handleChange = (newValue: string): void => {
    setLocalValue(newValue)
    throttledEmitChange(name, newValue)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(name, event.target.value)
    onBlur?.(event)
  }

  return (
    <MuiColorInput
      {...props}
      name={name}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      format={format}
      isAlphaHidden={isAlphaHidden}
      size="small"
      variant="outlined"
      fullWidth
      margin="dense"
      PopoverProps={colorInputPopoverProps}
      sx={[baseTextInputSx, colorInputAdornedInputSx, ...resolvedSx]}
    />
  )
}
