import { ReactNode } from 'react'

import * as styledEl from './SettingsInput.styled'

import { SettingsInputWrapper } from '../SettingsInputWrapper/SettingsInputWrapper.pure'

export interface SettingsInputProps {
  id: string
  label: string
  tooltip?: ReactNode
  placeholder?: string
  value?: string
  unit?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  disabled?: boolean
  error?: boolean
  leftSlot?: ReactNode
  footerSlot?: ReactNode
}

export function SettingsInput({
  id,
  label,
  tooltip,
  placeholder,
  value,
  unit,
  onChange,
  onBlur,
  disabled,
  error,
  leftSlot,
  footerSlot,
}: SettingsInputProps): ReactNode {
  return (
    <SettingsInputWrapper id={id} label={label} tooltip={tooltip} footerSlot={footerSlot}>
      <styledEl.InputWrapper $hasLeftSlot={!!leftSlot} $hasError={!!error}>
        {leftSlot}

        <styledEl.Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete="off"
        />

        {unit && <styledEl.Unit>{unit}</styledEl.Unit>}
      </styledEl.InputWrapper>
    </SettingsInputWrapper>
  )
}
