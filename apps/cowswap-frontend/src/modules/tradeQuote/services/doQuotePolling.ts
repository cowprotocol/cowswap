import { PriceQuality } from '@cowprotocol/cow-sdk'
import { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { AppDataInfo } from '../../appData'
import { TradeQuoteState } from '../state/tradeQuoteAtom'
import { TradeQuoteFetchParams } from '../types'
import { quoteUsingSameParameters } from '../utils/quoteUsingSameParameters'

function isQuoteCached(quote: TradeQuoteState): boolean {
  const hasCachedResponse = quote.quote
  const hasCachedError = quote.error

  return Boolean(hasCachedResponse || hasCachedError)
}

export interface QuoteUpdateContext {
  currentQuote: TradeQuoteState
  quoteParams: QuoteBridgeRequest | undefined
  appData: AppDataInfo['doc'] | undefined
  fetchQuote(fetchParams: TradeQuoteFetchParams): Promise<void>
  hasParamsChanged: boolean
  forceUpdate: boolean
  isBrowserOnline: boolean
  isConfirmOpen: boolean
  fastQuote?: boolean
  hasSmartSlippage?: boolean
}

export function doQuotePolling({
  currentQuote,
  quoteParams,
  appData,
  forceUpdate,
  hasParamsChanged,
  isBrowserOnline,
  isConfirmOpen,
  fastQuote,
  fetchQuote,
  hasSmartSlippage,
}: QuoteUpdateContext): boolean {
  const currentQuoteAppDataDoc = currentQuote.quote?.quoteResults.appDataInfo.doc

  if (!forceUpdate) {
    if (
      isQuoteCached(currentQuote) &&
      quoteUsingSameParameters(currentQuote, quoteParams, currentQuoteAppDataDoc, appData, hasSmartSlippage)
    ) {
      return false
    }

    if (!isBrowserOnline) {
      return false
    }
  }

  const isBridging = !!quoteParams && quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId
  const fetchStartTimestamp = Date.now()

  if (fastQuote && !isConfirmOpen && !isBridging) {
    fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.FAST, fetchStartTimestamp })
  }
  fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.OPTIMAL, fetchStartTimestamp })

  return true
}
