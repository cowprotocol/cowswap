import { ReactNode, useEffect, useRef } from 'react'

import { t } from '@lingui/core/macro'

import * as styledEl from './PricePercentageShortcuts.styled'

import { isValidPercentageInput, PRICE_PERCENTAGE_PRESETS } from '../../utils/percentageRate.utils'

export interface PricePercentageShortcutsProps {
  isInverted: boolean
  disabled: boolean
  selectedPreset?: string
  onSelect: (percentage: string | null) => void
  customInput?: {
    value: string
    selected: boolean
    invalid: boolean
    focus?: boolean
    onChange: (percentage: string) => void
  }
}

export function PricePercentageShortcuts(props: PricePercentageShortcutsProps): ReactNode {
  const { isInverted, disabled, selectedPreset, onSelect, customInput } = props

  const customField = useRef<HTMLDivElement>(null)
  const didFocusCustom = useRef(false)
  const focusCustom = customInput?.focus

  useEffect(() => {
    if (!focusCustom) {
      didFocusCustom.current = false
      return
    }
    if (disabled || didFocusCustom.current) return
    customField.current?.querySelector('input')?.focus()
    didFocusCustom.current = true
  }, [focusCustom, disabled])

  return (
    <styledEl.Shortcuts role="group" aria-label={t`Price relative to market`}>
      {PRICE_PERCENTAGE_PRESETS.map((percentage) => (
        <styledEl.Shortcut
          key={percentage}
          type="button"
          disabled={disabled}
          aria-pressed={!disabled && selectedPreset === percentage}
          title={isInverted ? t`${percentage}% below market` : t`${percentage}% above market`}
          onClick={() => onSelect(percentage)}
        >
          {isInverted ? '-' : '+'}
          {percentage}%
        </styledEl.Shortcut>
      ))}
      {customInput ? (
        <styledEl.CustomPercentage
          ref={customField}
          $selected={!disabled && customInput.selected}
          $invalid={customInput.invalid}
        >
          <styledEl.CustomInput
            value={customInput.value}
            onUserInput={(value) => {
              if (isValidPercentageInput(value)) customInput.onChange(value)
            }}
            disabled={disabled}
            placeholder={t`Custom %`}
            aria-label={isInverted ? t`Custom percentage below market` : t`Custom percentage above market`}
            aria-invalid={customInput.invalid}
          />
          {customInput.value && <span aria-hidden="true">%</span>}
        </styledEl.CustomPercentage>
      ) : (
        <styledEl.Shortcut type="button" disabled={disabled} onClick={() => onSelect(null)}>
          {t`Custom %`}
        </styledEl.Shortcut>
      )}
    </styledEl.Shortcuts>
  )
}
