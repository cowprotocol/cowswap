import { PriceQuality } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { AppDataInfo } from '../../appData'
import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { TradeQuoteFetchParams } from '../types'
import { quoteUsingSameParameters } from '../utils/quoteUsingSameParameters'

export interface QuoteUpdateContext {
  currentQuote: TradeQuoteState
  quoteParams: QuoteBridgeRequest | undefined
  appData: AppDataInfo['doc'] | undefined
  fetchQuote(fetchParams: TradeQuoteFetchParams): Promise<void>
  hasParamsChanged: boolean
  forceUpdate: boolean
  isBrowserOnline: boolean
  isConfirmOpen: boolean
  hasPendingTrade: boolean
  fastQuote?: boolean
  hasSmartSlippage?: boolean
}

function isQuoteCached(quote: TradeQuoteState): boolean {
  return Boolean(quote.quote || quote.error)
}

function shouldSkipDueToCachedOrOffline(
  currentQuote: TradeQuoteState,
  quoteParams: QuoteBridgeRequest | undefined,
  appDataDoc: QuoteUpdateContext['appData'],
  hasSmartSlippage: boolean | undefined,
  forceUpdate: boolean,
  isBrowserOnline: boolean,
): boolean {
  if (forceUpdate) return false
  if (
    isQuoteCached(currentQuote) &&
    quoteUsingSameParameters(
      currentQuote,
      quoteParams,
      currentQuote.quote?.quoteResults.appDataInfo.doc,
      appDataDoc,
      hasSmartSlippage,
    )
  ) {
    return true
  }
  return !isBrowserOnline
}

function runBridgingFlow(
  isConfirmOpen: boolean,
  currentQuote: TradeQuoteState,
  fetchQuote: QuoteUpdateContext['fetchQuote'],
  hasParamsChanged: boolean,
): boolean {
  if (!isConfirmOpen) return false
  if (isQuoteCached(currentQuote)) return false
  const fetchStartTimestamp = Date.now()
  fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.OPTIMAL, fetchStartTimestamp })
  return true
}

function runNonBridgingFlow(
  isConfirmOpen: boolean,
  fastQuote: boolean | undefined,
  fetchQuote: QuoteUpdateContext['fetchQuote'],
  hasParamsChanged: boolean,
): boolean {
  if (isConfirmOpen) return false
  const fetchStartTimestamp = Date.now()
  if (fastQuote) {
    fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.FAST, fetchStartTimestamp })
  }
  fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.OPTIMAL, fetchStartTimestamp })
  return true
}

export function doQuotePolling(context: QuoteUpdateContext): boolean {
  const {
    currentQuote,
    quoteParams,
    appData,
    forceUpdate,
    hasParamsChanged,
    isBrowserOnline,
    isConfirmOpen,
    hasPendingTrade,
    fastQuote,
    fetchQuote,
    hasSmartSlippage,
  } = context

  if (hasPendingTrade) return false

  if (
    shouldSkipDueToCachedOrOffline(currentQuote, quoteParams, appData, hasSmartSlippage, forceUpdate, isBrowserOnline)
  ) {
    return false
  }

  const isBridging = !!quoteParams && quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId

  if (isBridging) {
    return runBridgingFlow(isConfirmOpen, currentQuote, fetchQuote, hasParamsChanged)
  }

  return runNonBridgingFlow(isConfirmOpen, fastQuote, fetchQuote, hasParamsChanged)
}
