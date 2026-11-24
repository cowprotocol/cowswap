import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useRef, type RefObject } from 'react'

import { currencyAmountToTokenAmount, isSellOrder, normalizeError, onlyResolvesLast } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, type Price, type Token } from '@cowprotocol/currency'
import type { CrossChainQuoteAndPost } from '@cowprotocol/sdk-bridging'
import { isBridgeQuoteAndPost } from '@cowprotocol/sdk-bridging'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useAppDataBuildParams, useEnableWaitForCow } from 'modules/appData'
import {
  canonicalBatchScheduleAtom,
  formatPositiveFiat,
  isCanonicalBatchScheduleErrorAtom,
  useIsHooksTradeType,
  useIsWaitAndSaveAvailable,
  waitAndSaveComparisonQuoteAtom,
  waitAndSaveEnabledAtom,
} from 'modules/trade'
import { useQuoteParams, useTradeQuote } from 'modules/tradeQuote'
import { useUsdPrice } from 'modules/usdAmount'

import { buildWaitAndSaveComparisonRequest } from './buildWaitAndSaveComparisonRequest'

import { useSwapDerivedState } from '../hooks/useSwapDerivedState'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getQuoteOnlyResolveLast = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)

/** Volume-fee waivers are a fraction of a percent. A wider buy-amount gap is two different prices. */
const DISCONNECT_GAP_BPS = 100n

interface DiffContext {
  currency: Currency | undefined
  isSell: boolean
  price: Price<Token, Token> | null
}

interface LoggedQuote {
  buyAmount: string | undefined
  feeAmount: string | undefined
  sellAmount: string | undefined
}

interface QuotePairParams {
  comparison: LoggedQuote
  comparisonQuotedAtSec: number
  diff: DiffContext
  isOnQuote: boolean
  main: LoggedQuote
  mainQuotedAtSec: number | null
  requestedAmount: string
}

export function WaitAndSaveComparisonQuoteUpdater(props: { isSmartSlippage?: boolean; slippageBips: number }): null {
  const { isSmartSlippage, slippageBips } = props
  const isAvailable = useIsWaitAndSaveAvailable()
  const isEnabled = useAtomValue(waitAndSaveEnabledAtom)
  const isWaitAndSaveQuote = useEnableWaitForCow()
  const schedule = useAtomValue(canonicalBatchScheduleAtom)
  const hasScheduleError = useAtomValue(isCanonicalBatchScheduleErrorAtom)
  const { inputCurrencyAmount, orderKind, outputCurrencyAmount } = useSwapDerivedState()
  const { isSell, ref: diffContextRef } = useDiffContext(
    orderKind,
    inputCurrencyAmount?.currency,
    outputCurrencyAmount?.currency,
  )
  const partiallyFillable = useIsHooksTradeType()
  const amount = isSell ? inputCurrencyAmount : outputCurrencyAmount
  const quoteParams = useQuoteParams(amount?.quotient.toString(), partiallyFillable)?.quoteParams
  const { error: quoteError, isLoading, localQuoteTimestamp, quote } = useTradeQuote()
  const mainLoggedQuote = readMainQuote(quote?.quoteResults.quoteResponse.quote)
  const { buyAmount: mainBuyAmount, feeAmount: mainFeeAmount, sellAmount: mainSellAmount } = mainLoggedQuote
  const appDataParams = useAppDataBuildParams({
    enableWaitForCow: !isEnabled,
    isSmartSlippage,
    orderClass: 'market',
    slippageBips,
  })
  const setComparison = useSetAtom(waitAndSaveComparisonQuoteAtom)
  const canCompare = Boolean(
    isAvailable && !hasScheduleError && schedule && quoteParams && mainBuyAmount && !quoteError,
  )

  useEffect(() => {
    if (!canCompare || !schedule || !quoteParams || !mainBuyAmount) {
      setComparison(null)
      return
    }

    if (isLoading) return

    return startComparisonFetch({
      appDataParams,
      diff: diffContextRef.current,
      isOnQuote: !isWaitAndSaveQuote,
      mainBuyAmount,
      mainFeeAmount,
      mainQuotedAtSec: localQuoteTimestamp,
      mainSellAmount,
      quoteParams,
      setComparison,
    })
  }, [
    appDataParams,
    canCompare,
    isLoading,
    isWaitAndSaveQuote,
    localQuoteTimestamp,
    mainBuyAmount,
    mainFeeAmount,
    mainSellAmount,
    diffContextRef,
    quoteParams,
    schedule,
    setComparison,
  ])

  return null
}

function formatDiffUsd(diff: DiffContext, atoms: bigint | undefined): string | undefined {
  if (!diff.currency || !diff.price || atoms === undefined || atoms === 0n) return undefined

  const negative = atoms < 0n
  const amount = currencyAmountToTokenAmount(
    CurrencyAmount.fromRawAmount(diff.currency, (negative ? -atoms : atoms).toString()),
  )
  if (!diff.price.baseCurrency.equals(amount.currency)) return undefined

  const formatted = formatPositiveFiat(diff.price.quote(amount))
  if (!formatted) return undefined

  return negative ? `-${formatted}` : formatted
}

function gapBetween(left: string | undefined, right: string | undefined): bigint | undefined {
  const leftAtoms = parseAtoms(left)
  const rightAtoms = parseAtoms(right)
  if (leftAtoms === undefined || rightAtoms === undefined) return undefined

  return gapBps(leftAtoms, rightAtoms)
}

function gapBps(left: bigint, right: bigint): bigint {
  const high = left > right ? left : right
  const low = left > right ? right : left
  if (high === 0n) return 0n

  return ((high - low) * 10000n) / high
}

function grossSell(quote: Pick<LoggedQuote, 'feeAmount' | 'sellAmount'>): string | undefined {
  const sell = parseAtoms(quote.sellAmount)
  if (sell === undefined) return undefined

  return (sell + (parseAtoms(quote.feeAmount) ?? 0n)).toString()
}

function logQuoteDisconnect(params: QuotePairParams): void {
  const report = readQuoteReport(params)
  if (report.reliable) {
    console.info('[WaitAndSave] quote comparison', report.entry)
    return
  }
  if (!report.disconnected) return

  console.warn('[WaitAndSave] quote disconnect', report.entry)
}

function parseAtoms(value: string | undefined): bigint | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined

  return BigInt(value)
}

function publishComparison(params: {
  diff: DiffContext
  mainBuyAmount: string
  mainFeeAmount: string | undefined
  mainQuotedAtSec: number | null
  mainSellAmount: string | undefined
  result: {
    request: { isOnQuote: boolean; quoteParams: { amount?: { toString(): string } } }
    response: { cancelled: boolean; data: CrossChainQuoteAndPost | undefined }
  }
  setComparison: (next: { buyAmount: string; isOnQuote: boolean; mainBuyAmount: string } | null) => void
}): void {
  const { request, response } = params.result
  if (response.cancelled) return

  const comparison = readQuoteAmounts(response.data)
  if (!comparison?.buyAmount) {
    params.setComparison(null)
    return
  }

  logQuoteDisconnect({
    comparison,
    comparisonQuotedAtSec: Math.floor(Date.now() / 1000),
    diff: params.diff,
    isOnQuote: request.isOnQuote,
    main: {
      buyAmount: params.mainBuyAmount,
      feeAmount: params.mainFeeAmount,
      sellAmount: params.mainSellAmount,
    },
    mainQuotedAtSec: params.mainQuotedAtSec,
    requestedAmount: request.quoteParams.amount?.toString() ?? '',
  })
  params.setComparison({
    buyAmount: comparison.buyAmount,
    isOnQuote: request.isOnQuote,
    mainBuyAmount: params.mainBuyAmount,
  })
}

function quoteDiff(params: {
  comparison: LoggedQuote
  diff: DiffContext
  main: LoggedQuote
}): { diffBuy?: string; diffBuyUsd?: string } | { diffSell?: string; diffSellUsd?: string } {
  if (params.diff.isSell) {
    const diff = subtractAtoms(params.main.buyAmount, params.comparison.buyAmount)
    return { diffBuy: diff?.toString(), diffBuyUsd: formatDiffUsd(params.diff, diff) }
  }

  const diff = subtractAtoms(grossSell(params.main), grossSell(params.comparison))
  return { diffSell: diff?.toString(), diffSellUsd: formatDiffUsd(params.diff, diff) }
}

function quoteReason(sellAmountDiffers: boolean, withinFee: boolean): string {
  if (sellAmountDiffers) {
    return 'Side quote was requested for a different sell amount than the swap quote now on screen.'
  }
  if (withinFee) return 'Same trade, and the buy-amount gap is within a volume fee.'

  return 'Same sell amount, but the side quote buy amount is a different price than the swap quote. The two requests settle independently, so one can still be the earlier worse price.'
}

function readMainQuote(
  quote: { buyAmount?: string; feeAmount?: string; sellAmount?: string } | undefined,
): LoggedQuote {
  return {
    buyAmount: quote?.buyAmount,
    feeAmount: quote?.feeAmount == null ? undefined : String(quote.feeAmount),
    sellAmount: quote?.sellAmount == null ? undefined : String(quote.sellAmount),
  }
}

function readQuoteAmounts(data: CrossChainQuoteAndPost | undefined): LoggedQuote | undefined {
  if (!data) return undefined

  const quote = (isBridgeQuoteAndPost(data) ? data.swap.quoteResponse : data.quoteResults.quoteResponse).quote

  return {
    buyAmount: quote.buyAmount ? String(quote.buyAmount) : undefined,
    feeAmount: quote.feeAmount == null ? undefined : String(quote.feeAmount),
    sellAmount: quote.sellAmount == null ? undefined : String(quote.sellAmount),
  }
}

function readQuoteReport(params: QuotePairParams): {
  disconnected: boolean
  entry: Record<string, unknown>
  reliable: boolean
} {
  const sellAmountDiffers = sellAmountsDiffer(params.main.sellAmount, params.main.feeAmount, params.requestedAmount)
  const buyGap = gapBetween(params.main.buyAmount, params.comparison.buyAmount)
  const withinFee = buyGap !== undefined && buyGap <= DISCONNECT_GAP_BPS

  return {
    disconnected: sellAmountDiffers || (buyGap !== undefined && buyGap > DISCONNECT_GAP_BPS),
    reliable: !sellAmountDiffers && withinFee,
    entry: {
      reason: quoteReason(sellAmountDiffers, withinFee),
      buyGapBps: buyGap?.toString(),
      comparisonQuote: {
        ...params.comparison,
        isOnQuote: params.isOnQuote,
        quotedAtSec: params.comparisonQuotedAtSec,
        quotedSellAmount: params.requestedAmount,
      },
      mainQuote: { ...params.main, quotedAtSec: params.mainQuotedAtSec },
      quoteTimeDiffSeconds: secondsBetween(params.mainQuotedAtSec, params.comparisonQuotedAtSec),
      ...quoteDiff(params),
    },
  }
}

function secondsBetween(earlierSec: number | null, laterSec: number): number | undefined {
  if (earlierSec == null) return undefined

  return laterSec - earlierSec
}

/** A sell quote stores the amount after the network fee. Adding the fee back is the amount the user typed. */
function sellAmountsDiffer(
  mainSellAmount: string | undefined,
  mainFeeAmount: string | undefined,
  quotedSellAmount: string,
): boolean {
  const gross = parseAtoms(grossSell({ feeAmount: mainFeeAmount, sellAmount: mainSellAmount }))
  const quotedSell = parseAtoms(quotedSellAmount)
  if (gross === undefined || quotedSell === undefined) return false

  return gapBps(gross, quotedSell) > DISCONNECT_GAP_BPS
}

function startComparisonFetch(params: {
  appDataParams: Parameters<typeof buildWaitAndSaveComparisonRequest>[0]['appDataParams']
  diff: DiffContext
  isOnQuote: boolean
  mainBuyAmount: string
  mainFeeAmount: string | undefined
  mainQuotedAtSec: number | null
  mainSellAmount: string | undefined
  quoteParams: Parameters<typeof buildWaitAndSaveComparisonRequest>[0]['quoteParams']
  setComparison: (next: { buyAmount: string; isOnQuote: boolean; mainBuyAmount: string } | null) => void
}): () => void {
  let cancelled = false

  buildWaitAndSaveComparisonRequest({
    appDataParams: params.appDataParams,
    isOnQuote: params.isOnQuote,
    quoteParams: params.quoteParams,
  })
    .then((request) => {
      if (cancelled || !request) return undefined

      return getQuoteOnlyResolveLast(request.quoteParams, request.advancedSettings).then((response) => ({
        request,
        response,
      }))
    })
    .then((result) => {
      if (cancelled || !result) return

      publishComparison({
        diff: params.diff,
        mainBuyAmount: params.mainBuyAmount,
        mainFeeAmount: params.mainFeeAmount,
        mainQuotedAtSec: params.mainQuotedAtSec,
        mainSellAmount: params.mainSellAmount,
        result,
        setComparison: params.setComparison,
      })
    })
    .catch((err: unknown) => {
      const error = normalizeError(err)
      console.error('[WaitAndSaveComparisonQuoteUpdater]:: fetchQuote error', error)
      if (!cancelled) params.setComparison(null)
    })

  return () => {
    cancelled = true
  }
}

function subtractAtoms(left: string | undefined, right: string | undefined): bigint | undefined {
  const leftAtoms = parseAtoms(left)
  const rightAtoms = parseAtoms(right)
  if (leftAtoms === undefined || rightAtoms === undefined) return undefined

  return leftAtoms - rightAtoms
}

function toPriceToken(currency: Currency | undefined): Token | undefined {
  if (!currency) return undefined

  return currencyAmountToTokenAmount(CurrencyAmount.fromRawAmount(currency, '1')).currency
}

function useDiffContext(
  orderKind: Parameters<typeof isSellOrder>[0],
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
): { isSell: boolean; ref: RefObject<DiffContext> } {
  const isSell = isSellOrder(orderKind)
  const sellToken = useMemo(() => toPriceToken(inputCurrency), [inputCurrency])
  const buyToken = useMemo(() => toPriceToken(outputCurrency), [outputCurrency])
  const sellUsdPrice = useUsdPrice(sellToken)
  const buyUsdPrice = useUsdPrice(buyToken)
  const ref = useRef<DiffContext>({ currency: undefined, isSell: true, price: null })
  // Read when the response arrives so a price tick does not refetch the side quote.
  // eslint-disable-next-line react-hooks/refs
  ref.current = {
    currency: isSell ? outputCurrency : inputCurrency,
    isSell,
    price: (isSell ? buyUsdPrice : sellUsdPrice)?.price ?? null,
  }

  return { isSell, ref }
}
