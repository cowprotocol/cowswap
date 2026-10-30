import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'
import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

export function buildWaitAndSaveOutcome(params: {
  buyToken: Currency
  fiatAmount: CurrencyAmount<Currency> | null
  gain: PositiveAloneGain
}): WaitAndSaveOutcomeProps {
  const { buyToken, fiatAmount, gain } = params

  return {
    gainAmount: formatOutcomeAmount(buyToken, gain.gainAmount),
    gainFiat: formatGainFiat(fiatAmount),
    gainNumeric: toLayoutNumber(buyToken, gain.gainAmount),
    gainPercent: gain.gainPercent,
    tokenSymbol: buyToken.symbol ?? '',
    tradingAloneAmount: formatOutcomeAmount(buyToken, gain.bestAloneBuyAmount),
    tradingAloneNumeric: toLayoutNumber(buyToken, gain.bestAloneBuyAmount),
  }
}

export function formatGainFiat(amount: CurrencyAmount<Currency> | null): string {
  if (!amount || !amount.greaterThan(0)) return ''

  const centScale = Math.max(amount.currency.decimals - 2, 0)
  const oneCent = CurrencyAmount.fromRawAmount(amount.currency, (10n ** BigInt(centScale)).toString())
  if (amount.lessThan(oneCent)) return '<$0.01'

  const formatted = formatFiatAmount(amount)
  return formatted ? `$${formatted}` : ''
}

function formatOutcomeAmount(token: Currency, rawAmount: bigint): string {
  return formatTokenAmount(CurrencyAmount.fromRawAmount(token, rawAmount.toString()))
}

function toLayoutNumber(token: Currency, rawAmount: bigint): number {
  const value = Number(CurrencyAmount.fromRawAmount(token, rawAmount.toString()).toExact())
  return Number.isFinite(value) ? value : 0
}
