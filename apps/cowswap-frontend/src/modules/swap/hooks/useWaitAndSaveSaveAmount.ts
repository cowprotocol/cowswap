import { useAtomValue } from 'jotai'

import type { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useEnableWaitForCow } from 'modules/appData'
import {
  formatPositiveFiat,
  getWaitAndSaveWaivedFeeRawAmount,
  isCanonicalBatchScheduleErrorAtom,
  useDerivedTradeState,
  waitAndSaveComparisonQuoteAtom,
  type WaitAndSaveComparisonQuote,
  type WaitAndSaveMainQuote,
  type WaitAndSaveWaivedFeeRawAmount,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

let lastDisconnectLogKey = ''

export function useWaitAndSaveSaveAmount(): string | undefined {
  const userQuoteWithWaitAndSave = useEnableWaitForCow()
  const hasScheduleError = useAtomValue(isCanonicalBatchScheduleErrorAtom)
  const comparison = useAtomValue(waitAndSaveComparisonQuoteAtom)
  const derived = useDerivedTradeState()
  const mainQuote = readMainQuote(useTradeQuote().quote?.quoteResults.quoteResponse.quote)
  const waivedFee = selectWaivedFee({
    comparison,
    hasScheduleError,
    mainQuote,
    orderKind: derived?.orderKind,
    userQuoteWithWaitAndSave,
  })
  const token = pricedToken(waivedFee?.currency, derived)
  const feeAmount = toCurrencyAmount(token, waivedFee?.amount)
  const label = formatPositiveFiat(useUsdAmount(feeAmount).value)

  logDisplayedDisconnect({
    comparison,
    currency: waivedFee?.currency,
    mainQuote,
    rawAmount: waivedFee?.amount,
    symbol: token?.symbol,
    userQuoteWithWaitAndSave,
  })

  return label
}

function toCurrencyAmount(
  token: Currency | null | undefined,
  rawAmount: bigint | undefined,
): CurrencyAmount<Currency> | undefined {
  if (!token || rawAmount === undefined) return undefined

  return CurrencyAmount.fromRawAmount(token, rawAmount.toString())
}

/** Volume-fee waivers are a fraction of a percent. A wider gap is two different prices. */
const DISCONNECT_GAP_BPS = 100n

interface DisplayedGap {
  currency: WaitAndSaveWaivedFeeRawAmount['currency']
  off: string
  on: string
}

interface LogDisplayedDisconnectParams {
  comparison: WaitAndSaveComparisonQuote | null
  currency: WaitAndSaveWaivedFeeRawAmount['currency'] | undefined
  mainQuote: WaitAndSaveMainQuote
  rawAmount: bigint | undefined
  symbol: string | undefined
  userQuoteWithWaitAndSave: boolean
}

interface SelectWaivedFeeParams {
  comparison: WaitAndSaveComparisonQuote | null
  hasScheduleError: boolean
  mainQuote: WaitAndSaveMainQuote
  orderKind: OrderKind | undefined
  userQuoteWithWaitAndSave: boolean
}

function amountString(value: string | null | undefined): string | undefined {
  if (value == null) return undefined

  return String(value)
}

function disconnectReason(currency: DisplayedGap['currency']): string {
  const side = currency === 'sell' ? 'sell-amount' : 'buy-amount'

  return `Showing a ${side} gap wider than a volume fee. The on-quote and off-quote settled on different prices for this trade, so their difference is not the waived fee.`
}

function grossSell(sellAmount: string | undefined, feeAmount: string | undefined): bigint | undefined {
  const sell = parseAtoms(sellAmount)
  if (sell === undefined) return undefined

  const fee = feeAmount ? parseAtoms(feeAmount) : 0n
  if (fee === undefined) return undefined

  return sell + fee
}

function isWideGap(onAtoms: bigint | undefined, offAtoms: bigint | undefined, rawAmount: bigint): boolean {
  if (onAtoms === undefined || offAtoms === undefined) return false

  const smaller = onAtoms < offAtoms ? onAtoms : offAtoms
  return smaller > 0n && (rawAmount * 10000n) / smaller > DISCONNECT_GAP_BPS
}

function logDisplayedDisconnect(params: LogDisplayedDisconnectParams): void {
  const displayed = readDisplayedGap(params)
  if (!displayed) return

  const key = `${displayed.currency}:${displayed.on}:${displayed.off}:${params.userQuoteWithWaitAndSave}`
  if (key === lastDisconnectLogKey) return
  lastDisconnectLogKey = key

  console.warn('[WaitAndSave] savings disconnect', {
    reason: disconnectReason(displayed.currency),
    offAmount: displayed.off,
    onAmount: displayed.on,
    savingsAtoms: params.rawAmount?.toString(),
    side: displayed.currency,
    symbol: params.symbol,
    userQuoteWithWaitAndSave: params.userQuoteWithWaitAndSave,
  })
}

function parseAtoms(value: string | undefined): bigint | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined

  return BigInt(value)
}

function pricedToken(
  currency: WaitAndSaveWaivedFeeRawAmount['currency'] | undefined,
  derived: ReturnType<typeof useDerivedTradeState>,
): Currency | null | undefined {
  if (currency === 'sell') return derived?.inputCurrency

  return derived?.outputCurrency
}

function readBuyGap(params: LogDisplayedDisconnectParams): DisplayedGap | undefined {
  const { comparison, mainQuote, rawAmount, userQuoteWithWaitAndSave } = params
  if (!comparison || rawAmount === undefined || !mainQuote.buyAmount) return undefined

  const on = userQuoteWithWaitAndSave ? mainQuote.buyAmount : comparison.buyAmount
  const off = userQuoteWithWaitAndSave ? comparison.buyAmount : mainQuote.buyAmount
  if (!isWideGap(parseAtoms(on), parseAtoms(off), rawAmount)) return undefined

  return { currency: 'buy', off, on }
}

function readDisplayedGap(params: LogDisplayedDisconnectParams): DisplayedGap | undefined {
  if (!params.comparison || params.rawAmount === undefined || !params.currency) return undefined

  return params.currency === 'buy' ? readBuyGap(params) : readSellGap(params)
}

function readMainQuote(
  quote: { buyAmount?: string; feeAmount?: string | null; sellAmount?: string | null } | undefined,
): WaitAndSaveMainQuote {
  return {
    buyAmount: quote?.buyAmount,
    feeAmount: amountString(quote?.feeAmount),
    sellAmount: amountString(quote?.sellAmount),
  }
}

function readSellGap(params: LogDisplayedDisconnectParams): DisplayedGap | undefined {
  const { comparison, mainQuote, rawAmount, userQuoteWithWaitAndSave } = params
  if (!comparison || rawAmount === undefined) return undefined

  const mainGross = grossSell(mainQuote.sellAmount, mainQuote.feeAmount)
  const comparisonGross = grossSell(comparison.sellAmount, comparison.feeAmount)
  const on = userQuoteWithWaitAndSave ? mainGross : comparisonGross
  const off = userQuoteWithWaitAndSave ? comparisonGross : mainGross
  if (on === undefined || off === undefined || !isWideGap(on, off, rawAmount)) return undefined

  return { currency: 'sell', off: off.toString(), on: on.toString() }
}

function selectWaivedFee(params: SelectWaivedFeeParams): WaitAndSaveWaivedFeeRawAmount | undefined {
  if (params.hasScheduleError) return undefined

  return getWaitAndSaveWaivedFeeRawAmount(params)
}
