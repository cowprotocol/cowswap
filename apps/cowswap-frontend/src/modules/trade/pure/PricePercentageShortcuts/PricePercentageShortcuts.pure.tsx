import { ReactNode, useState } from 'react'

import { formatInputAmount } from '@cowprotocol/common-utils'
import { Fraction } from '@cowprotocol/currency'

import { t } from '@lingui/core/macro'

import * as styledEl from './PricePercentageShortcuts.styled'

import { getPercentageRate } from '../../utils/percentageRate.utils'

export interface PricePercentageShortcutsProps {
  referenceRate: Fraction | null
  activeRate: Fraction | null
  isInverted: boolean
  disabled: boolean
  onSelect: (rate: Fraction | null) => void
}

const PRESETS = ['5', '10', '20']

export function PricePercentageShortcuts({
  referenceRate,
  activeRate,
  isInverted,
  disabled,
  onSelect,
}: PricePercentageShortcutsProps): ReactNode {
  const [customPercentage, setCustomPercentage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const isDisabled = disabled || !referenceRate?.greaterThan(0)
  const customRate = getPercentageRate(referenceRate, customPercentage, isInverted)
  const matchesRate = (rate: Fraction | null): boolean =>
    !!rate &&
    !!activeRate?.greaterThan(0) &&
    formatInputAmount(isInverted ? rate.invert() : rate) ===
      formatInputAmount(isInverted ? activeRate.invert() : activeRate)
  const selectedPreset = PRESETS.find((percentage) =>
    matchesRate(getPercentageRate(referenceRate, percentage, isInverted)),
  )
  const customMatches = !selectedPreset && matchesRate(customRate)
  const hasInvalidCustomValue = !!customPercentage && !customRate && !activeRate?.greaterThan(0)
  const customValue = isEditing || customMatches || hasInvalidCustomValue ? customPercentage : ''

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
              setCustomPercentage('')
              onSelect(rate)
            }}
          >
            {isInverted ? '−' : '+'}
            {percentage}%
          </styledEl.Shortcut>
        )
      })}
      <styledEl.CustomPercentage $selected={!isDisabled && customMatches} $invalid={!!customValue && !customRate}>
        <styledEl.CustomInput
          value={customValue}
          onUserInput={(value) => {
            if (!/^\d*(?:\.\d{0,2})?$/.test(value)) return
            setCustomPercentage(value)
            onSelect(getPercentageRate(referenceRate, value, isInverted))
          }}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          disabled={isDisabled}
          placeholder={t`Custom %`}
          aria-label={isInverted ? t`Custom percentage below market` : t`Custom percentage above market`}
          aria-invalid={!!customValue && !customRate}
        />
        {customValue && <span>%</span>}
      </styledEl.CustomPercentage>
    </styledEl.Shortcuts>
  )
}
