import { useAtomValue } from 'jotai'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import {
  formatPositiveFiat,
  getWaitAndSaveWaivedFeeRawAmount,
  isCanonicalBatchScheduleErrorAtom,
  useDerivedTradeState,
  waitAndSaveComparisonQuoteAtom,
  waitAndSaveEnabledAtom,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

let lastDisconnectLogKey = ''

export function useWaitAndSaveSaveAmount(): string | undefined {
  const isEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const hasScheduleError = useAtomValue(isCanonicalBatchScheduleErrorAtom)
  const comparison = useAtomValue(waitAndSaveComparisonQuoteAtom)
  const mainBuyAmount = useTradeQuote().quote?.quoteResults.quoteResponse.quote.buyAmount
  const buyToken = useDerivedTradeState()?.outputCurrency
  const rawAmount = hasScheduleError
    ? undefined
    : getWaitAndSaveWaivedFeeRawAmount({ comparison, isEnabled, mainBuyAmount })
  const feeAmount = toBuyAmount(buyToken, rawAmount)
  const label = formatPositiveFiat(useUsdAmount(feeAmount).value)

  logDisplayedDisconnect({ buySymbol: buyToken?.symbol, comparison, isEnabled, mainBuyAmount, rawAmount })

  return label
}

function toBuyAmount(
  buyToken: Currency | null | undefined,
  rawAmount: bigint | undefined,
): CurrencyAmount<Currency> | undefined {
  if (!buyToken || rawAmount === undefined) return undefined

  return CurrencyAmount.fromRawAmount(buyToken, rawAmount.toString())
}

/** Volume-fee waivers are a fraction of a percent. A wider gap is two different prices. */
const DISCONNECT_GAP_BPS = 100n

function isWideGap(onAtoms: bigint | undefined, offAtoms: bigint | undefined, rawAmount: bigint): boolean {
  if (onAtoms === undefined || offAtoms === undefined) return false

  const smaller = onAtoms < offAtoms ? onAtoms : offAtoms
  return smaller > 0n && (rawAmount * 10000n) / smaller > DISCONNECT_GAP_BPS
}

function logDisplayedDisconnect(params: {
  buySymbol: string | undefined
  comparison: { buyAmount: string; isOnQuote: boolean; mainBuyAmount: string } | null
  isEnabled: boolean
  mainBuyAmount: string | undefined
  rawAmount: bigint | undefined
}): void {
  const displayed = readDisplayedGap(params)
  if (!displayed) return

  const key = `${displayed.onBuy}:${displayed.offBuy}:${params.isEnabled}`
  if (key === lastDisconnectLogKey) return
  lastDisconnectLogKey = key

  console.warn('[WaitAndSave] savings disconnect', {
    reason:
      'Showing a buy-amount gap wider than a volume fee. The on-quote and off-quote settled on different prices for this trade, so their difference is not the waived fee.',
    buySymbol: params.buySymbol,
    isEnabled: params.isEnabled,
    offBuyAmount: displayed.offBuy,
    onBuyAmount: displayed.onBuy,
    savingsAtoms: params.rawAmount?.toString(),
  })
}

function parseAtoms(value: string): bigint | undefined {
  if (!/^\d+$/.test(value)) return undefined

  return BigInt(value)
}

function readDisplayedGap(params: {
  comparison: { buyAmount: string } | null
  isEnabled: boolean
  mainBuyAmount: string | undefined
  rawAmount: bigint | undefined
}): { offBuy: string; onBuy: string } | undefined {
  const { comparison, isEnabled, mainBuyAmount, rawAmount } = params
  if (!comparison || rawAmount === undefined || !mainBuyAmount) return undefined

  const onBuy = isEnabled ? mainBuyAmount : comparison.buyAmount
  const offBuy = isEnabled ? comparison.buyAmount : mainBuyAmount
  if (!isWideGap(parseAtoms(onBuy), parseAtoms(offBuy), rawAmount)) return undefined

  return { offBuy, onBuy }
}
