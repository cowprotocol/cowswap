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
    // Don't fetch quote if the parameters are the same
    // Also avoid quote refresh when only appData.quote (contains slippage) is changed
    // Important! We should skip quote updating only if there is no quote response
    if (
      isQuoteCached(currentQuote) &&
      quoteUsingSameParameters(currentQuote, quoteParams, currentQuoteAppDataDoc, appData, hasSmartSlippage)
    ) {
      return false
    }

    // When browser is offline or the tab is not active do no fetch
    if (!isBrowserOnline) {
      return false
    }
  }

  const isBridging = !!quoteParams && quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId
  const fetchStartTimestamp = Date.now()

  // Don't fetch fast quote in confirm screen and in bridging mode
  if (fastQuote && !isConfirmOpen && !isBridging) {
    fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.FAST, fetchStartTimestamp })
  }
  fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.OPTIMAL, fetchStartTimestamp })

  return true
}
