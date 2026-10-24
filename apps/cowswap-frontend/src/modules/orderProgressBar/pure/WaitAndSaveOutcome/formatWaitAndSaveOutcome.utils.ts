import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import type { WaitAndSaveOutcomeProps } from './WaitAndSaveOutcome.pure'

/**
 * Formats a strictly positive Wait & Save buy gain for the finished-step card.
 *
 * @returns `null` when `gain` or `alone` is not strictly positive. `gainPercent`
 *   is `(gain / alone) * 100` (percent of the trading-alone buy, not of the
 *   executed buy). Missing fiat is shown as an em dash.
 */
export function formatWaitAndSaveOutcome({
  alone,
  gain,
  token,
  gainFiatAmount,
}: {
  alone: CurrencyAmount<Token>
  gain: CurrencyAmount<Token>
  token: Token
  gainFiatAmount: CurrencyAmount<Token> | null
}): WaitAndSaveOutcomeProps | null {
  if (!gain.greaterThan(0) || !alone.greaterThan(0)) return null

  const aloneExact = Number(alone.toExact())
  const gainExact = Number(gain.toExact())

  return {
    gainAmount: formatTokenAmount(gain),
    gainFiat: gainFiatAmount ? formatFiatAmount(gainFiatAmount) : '—',
    gainPercent: (gainExact / aloneExact) * 100,
    tradingAloneAmount: formatTokenAmount(alone),
    tradingAloneNumeric: aloneExact,
    gainNumeric: gainExact,
    tokenSymbol: token.symbol ?? '',
  }
}

/**
 * Extra buy versus the best same-auction trading-alone solution, in token atoms.
 *
 * @param executedBuy Winning-solution buy amount as a non-negative integer atom string.
 * @param tradingAloneBuy Best 1-trader-order buy in that auction, same encoding.
 * @returns `null` unless both amounts parse and `executedBuy` is strictly greater.
 */
export function positiveBuyGain(
  executedBuy: string,
  tradingAloneBuy: string,
  token: Token,
): { alone: CurrencyAmount<Token>; gain: CurrencyAmount<Token> } | null {
  if (!/^\d+$/.test(executedBuy) || !/^\d+$/.test(tradingAloneBuy)) return null

  const executed = CurrencyAmount.fromRawAmount(token, executedBuy)
  const alone = CurrencyAmount.fromRawAmount(token, tradingAloneBuy)

  if (!executed.greaterThan(alone)) return null

  return { alone, gain: executed.subtract(alone) }
}
