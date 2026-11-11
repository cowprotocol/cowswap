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
    onBlur?: () => void
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
    // Market rate / pair loading can disable the field after an early focus attempt.
    // Reset so we retry once the input is interactive again.
    if (disabled) {
      didFocusCustom.current = false
      return
    }
    if (didFocusCustom.current) return

    const input = customField.current?.querySelector('input')
    if (!input) return

    // Defer past navigation/modal teardown so focus isn't immediately stolen.
    const frameId = requestAnimationFrame(() => {
      input.focus()
      didFocusCustom.current = document.activeElement === input
    })

    return () => cancelAnimationFrame(frameId)
  }, [focusCustom, disabled])

  return (
    <styledEl.Shortcuts role="group" aria-label={t`Price relative to market`}>
      {PRICE_PERCENTAGE_PRESETS.map((percentage) => (
        <styledEl.Shortcut
          key={percentage}
          type="button"
          disabled={disabled}
          aria-pressed={selectedPreset === percentage}
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
            onBlur={customInput.onBlur}
            disabled={disabled}
            autoFocus={focusCustom && !disabled}
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
