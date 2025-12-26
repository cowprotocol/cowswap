import { atom } from 'jotai'

import { PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'
import { BridgeProviderQuoteError, BridgeQuoteResults } from '@cowprotocol/sdk-bridging'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { TradeQuoteFetchParams } from '../types'

type SellTokenAddress = string

export interface TradeQuoteState {
  quote: QuoteAndPost | null
  isBridgeQuote: boolean | null
  bridgeQuote: BridgeQuoteResults | null
  fetchParams: TradeQuoteFetchParams | null
  error: QuoteApiError | BridgeProviderQuoteError | null
  hasParamsChanged: boolean
  isLoading: boolean
  localQuoteTimestamp: number | null
  // cached slippageBps from quote response
  suggestedSlippageBps: number | null
}

export const DEFAULT_TRADE_QUOTE_STATE: TradeQuoteState = {
  quote: null,
  bridgeQuote: null,
  isBridgeQuote: null,
  fetchParams: null,
  error: null,
  hasParamsChanged: false,
  isLoading: false,
  localQuoteTimestamp: null,
  suggestedSlippageBps: null,
}

export const tradeQuotesAtom = atom<Record<SellTokenAddress, TradeQuoteState | undefined>>({})

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    // eslint-disable-next-line complexity
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = _sellTokenAddress.toLowerCase()
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      const fastPriceQuality = nextState.fetchParams?.priceQuality === PriceQuality.FAST

      // Don't update state if Fast quote finished after Optimal quote
      if (
        prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp &&
        nextState.quote &&
        fastPriceQuality
      ) {
        return { ...prevState }
      }

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quote: typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote,
        localQuoteTimestamp: nextState.quote ? Date.now() : null,
        suggestedSlippageBps:
          typeof nextState.suggestedSlippageBps === 'undefined'
            ? prevQuote.suggestedSlippageBps // preserve cached value
            : nextState.suggestedSlippageBps,
      }

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)
