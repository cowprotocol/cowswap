import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'

import { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.types'

export const MIN_GAIN_BAR_PX = 4
export const MIN_GAIN_PERCENT_DISPLAY = 0.01
export const HERO_FONT_MAX_PX = 34
export const HERO_FONT_MIN_PX = 20

export interface BuildWaitAndSaveOutcomeParams {
  surplusAmount: CurrencyAmount<Currency>
  surplusFiatValue: Nullish<CurrencyAmount<Currency>>
  showFiatValue: boolean
  surplusPercent: Nullish<string>
  executedAmount: CurrencyAmount<Currency>
  isSell: boolean
}

export interface GainBarLayout {
  aloneFlex: number
  gainFlex: number
  gainMinWidthPx: number
}

// eslint-disable-next-line complexity
export function buildWaitAndSaveOutcomeProps({
  surplusAmount,
  surplusFiatValue,
  showFiatValue,
  surplusPercent,
  executedAmount,
  isSell,
}: BuildWaitAndSaveOutcomeParams): WaitAndSaveOutcomeProps | null {
  if (!surplusAmount.currency.equals(executedAmount.currency)) {
    return null
  }

  const gainNumeric = Number(surplusAmount.toExact())
  if (!(gainNumeric > 0)) {
    return null
  }

  const quotedAmount = isSell ? getSellQuotedAmount(executedAmount, surplusAmount) : executedAmount
  if (!quotedAmount || !quotedAmount.greaterThan(0)) {
    return null
  }

  const gainPercent = Number.parseFloat(surplusPercent ?? '0')
  const gainAmount = formatTokenAmount(surplusAmount)
  const tradingAloneAmount = formatTokenAmount(quotedAmount)

  if (!gainAmount || !tradingAloneAmount) {
    return null
  }

  return {
    gainAmount,
    gainFiat: showFiatValue && surplusFiatValue ? formatFiatAmount(surplusFiatValue) : undefined,
    gainPercent: Number.isFinite(gainPercent) ? gainPercent : 0,
    tradingAloneAmount,
    tradingAloneNumeric: Number(quotedAmount.toExact()),
    gainNumeric,
    tokenSymbol: surplusAmount.currency.symbol ?? surplusAmount.currency.name ?? '',
  }
}

export function fitHeroFontSize(
  element: Pick<HTMLElement, 'scrollWidth' | 'clientWidth'> & { style: { fontSize: string } },
  maxPx: number = HERO_FONT_MAX_PX,
  minPx: number = HERO_FONT_MIN_PX,
): number {
  let size = maxPx
  element.style.fontSize = `${size}px`

  if (element.clientWidth <= 0) {
    return size
  }

  while (size > minPx && element.scrollWidth > element.clientWidth) {
    size -= 1
    element.style.fontSize = `${size}px`
  }

  return size
}

export function formatGainPercentLabel(percent: number): string {
  if (percent > 0 && percent < MIN_GAIN_PERCENT_DISPLAY) {
    return `<${MIN_GAIN_PERCENT_DISPLAY}%`
  }

  const rounded = percent >= 10 ? percent.toFixed(1) : percent.toFixed(2)
  return `+${rounded}%`
}

export function getGainBarLayout(tradingAloneAmount: number, gainAmount: number): GainBarLayout {
  const safeAlone = Math.max(0, tradingAloneAmount)
  const safeGain = Math.max(0, gainAmount)
  const total = safeAlone + safeGain

  if (total <= 0) {
    return { aloneFlex: 1, gainFlex: 0, gainMinWidthPx: 0 }
  }

  if (safeGain <= 0) {
    return { aloneFlex: 1, gainFlex: 0, gainMinWidthPx: 0 }
  }

  return {
    aloneFlex: safeAlone / total,
    gainFlex: safeGain / total,
    gainMinWidthPx: MIN_GAIN_BAR_PX,
  }
}

function getSellQuotedAmount(
  executedAmount: CurrencyAmount<Currency>,
  surplusAmount: CurrencyAmount<Currency>,
): CurrencyAmount<Currency> | null {
  if (!executedAmount.greaterThan(surplusAmount)) {
    return null
  }

  return executedAmount.subtract(surplusAmount)
}
