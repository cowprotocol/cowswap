import { ReactNode, useEffect, useRef, useState } from 'react'

import { formatInputAmount } from '@cowprotocol/common-utils'
import { Fraction } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'

import * as styledEl from './PricePercentageShortcuts.styled'

import { getPercentageRate } from '../../utils/percentageRate.utils'

export type PricePercentageShortcutsProps = {
  isInverted: boolean
  disabled: boolean
} & (
  | {
      mode: 'input'
      referenceRate: Fraction | null
      activeRate: Fraction | null
      selectedPercentage?: string | null
      onSelect: (rate: Fraction | null, percentage?: string) => void
      focusCustom?: boolean
    }
  | {
      mode: 'navigation'
      onSelect: (percentage: string | null) => void
    }
)

const PRESETS = ['5', '10', '20']

export function PricePercentageShortcuts(props: PricePercentageShortcutsProps): ReactNode {
  const { isInverted, disabled } = props
  const input = props.mode === 'input' ? props : null
  const referenceRate = input?.referenceRate ?? null
  const activeRate = input?.activeRate
  const selectedPercentage = input?.selectedPercentage
  const focusCustom = input?.focusCustom
  const customField = useRef<HTMLDivElement>(null)
  const didFocusCustom = useRef(false)
  const [customInput, setCustomInput] = useState<{ value: string; rate: Fraction | null } | null>(null)

  useEffect(() => {
    setCustomInput((current) => {
      if (!current || current.value === selectedPercentage) return current
      const matchesAppliedRate = current.rate ? activeRate?.equalTo(current.rate) : !activeRate?.greaterThan(0)
      return matchesAppliedRate ? current : null
    })
  }, [activeRate, selectedPercentage])
  const isDisabled = disabled || (props.mode === 'input' && !referenceRate?.greaterThan(0))
  useEffect(() => {
    if (!focusCustom || isDisabled || didFocusCustom.current) return
    customField.current?.querySelector('input')?.focus()
    didFocusCustom.current = true
  }, [focusCustom, isDisabled])
  const customRate = customInput ? getPercentageRate(referenceRate, customInput.value, isInverted) : null
  const customValue = customInput?.value ?? ''
  const matchesRate = (rate: Fraction | null): boolean =>
    !!rate &&
    !!activeRate?.greaterThan(0) &&
    formatInputAmount(isInverted ? rate.invert() : rate) ===
      formatInputAmount(isInverted ? activeRate.invert() : activeRate)
  const selectedPreset = PRESETS.find((percentage) =>
    matchesRate(getPercentageRate(referenceRate, percentage, isInverted)),
  )
  const customMatches = !selectedPreset && matchesRate(customRate)

  return (
    <styledEl.Shortcuts role="group" aria-label={t`Price relative to market`}>
      {PRESETS.map((percentage) => {
        const rate = getPercentageRate(referenceRate, percentage, isInverted)

        return (
          <styledEl.Shortcut
            key={percentage}
            type="button"
            disabled={isDisabled}
            aria-pressed={!isDisabled && selectedPreset === percentage}
            title={isInverted ? t`${percentage}% below market` : t`${percentage}% above market`}
            onClick={() => {
              setCustomInput(null)
              if (props.mode === 'navigation') props.onSelect(percentage)
              else props.onSelect(rate, percentage)
            }}
          >
            {isInverted ? '−' : '+'}
            {percentage}%
          </styledEl.Shortcut>
        )
      })}
      {props.mode === 'navigation' ? (
        <styledEl.Shortcut type="button" disabled={isDisabled} onClick={() => props.onSelect(null)}>
          {t`Custom %`}
        </styledEl.Shortcut>
      ) : (
        <styledEl.CustomPercentage
          ref={customField}
          $selected={!isDisabled && customMatches}
          $invalid={!!customValue && !customRate}
        >
          <styledEl.CustomInput
            value={customValue}
            onUserInput={(value) => {
              if (!/^\d*(?:\.\d{0,2})?$/.test(value)) return
              const rate = getPercentageRate(referenceRate, value, isInverted)
              if (Number(value) > 0 && !rate) return
              setCustomInput({ value, rate })
              props.onSelect(rate, value)
            }}
            disabled={isDisabled}
            placeholder={t`Custom %`}
            aria-label={isInverted ? t`Custom percentage below market` : t`Custom percentage above market`}
            aria-invalid={!!customValue && !customRate}
          />
          {customValue && <span aria-hidden="true">%</span>}
        </styledEl.CustomPercentage>
      )}
    </styledEl.Shortcuts>
  )
}
