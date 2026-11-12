import { formatInputAmount } from '@cowprotocol/common-utils'
import { Fraction } from '@cowprotocol/currency'

import { getPercentageRate, PRICE_PERCENTAGE_PRESETS } from 'modules/trade'

export interface CustomPercentageInput {
  value: string
  rate: Fraction | null
}

interface PercentageSelection {
  value: string
  isInverted: boolean
}

export function getCustomRate(
  referenceRate: Fraction | null,
  customInput: CustomPercentageInput | null,
  selection: PercentageSelection | null | undefined,
  isInverted: boolean,
): Fraction | null {
  if (customInput) return getPercentageRate(referenceRate, customInput.value, isInverted)
  if (!selection) return null
  return getPercentageRate(referenceRate, selection.value, selection.isInverted)
}

export function getCustomValue(
  customInput: CustomPercentageInput | null,
  selectedPreset: string | undefined,
  selectedPercentage: string | null,
): string {
  if (customInput) return customInput.value
  return selectedPreset ? '' : (selectedPercentage ?? '')
}

export function getMatchingCustomInput(
  customInput: CustomPercentageInput | null,
  selectedPercentage: string | null,
  activeRate: Fraction | null,
): CustomPercentageInput | null {
  if (!customInput || customInput.value === selectedPercentage) return customInput
  const matchesAppliedRate = customInput.rate ? activeRate?.equalTo(customInput.rate) : !activeRate?.greaterThan(0)
  return matchesAppliedRate ? customInput : null
}

export function getPercentageLockedInversion(
  selection: PercentageSelection | null | undefined,
  focusCustomPercentage: boolean,
): boolean | null {
  if (selection) return selection.isInverted
  if (focusCustomPercentage) return false
  return null
}

export function getSelectedPercentage(
  selection: PercentageSelection | null | undefined,
  isInverted: boolean,
): string | null {
  if (!selection) return null
  if (selection.isInverted === isInverted) return selection.value

  const rate = getPercentageRate(new Fraction(1), selection.value, selection.isInverted)
  if (!rate) return null

  return (isInverted ? new Fraction(1).subtract(rate.invert()) : rate.subtract(1)).multiply(100).toFixed(2)
}

export function getSelectedPreset(
  referenceRate: Fraction | null,
  activeRate: Fraction | null,
  isInverted: boolean,
): string | undefined {
  return PRICE_PERCENTAGE_PRESETS.find((percentage) =>
    matchesRate(getPercentageRate(referenceRate, percentage, isInverted), activeRate, isInverted),
  )
}

export function matchesRate(
  rate: Fraction | null,
  activeRate: Fraction | null | undefined,
  isInverted: boolean,
): boolean {
  if (!rate || !activeRate?.greaterThan(0)) return false

  return (
    formatInputAmount(isInverted ? rate.invert() : rate) ===
    formatInputAmount(isInverted ? activeRate.invert() : activeRate)
  )
}
