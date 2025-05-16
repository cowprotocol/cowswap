import { atom } from 'jotai'

import { PriceQuality, QuoteAndPost, BridgeQuoteResults, BridgeProviderQuoteError } from '@cowprotocol/cow-sdk'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { TradeQuoteFetchParams } from '../types'

type SellTokenAddress = string

export interface TradeQuoteState {
  quote: QuoteAndPost | null
  bridgeQuote: BridgeQuoteResults | null
  fetchParams: TradeQuoteFetchParams | null
  error: QuoteApiError | BridgeProviderQuoteError | null
  hasParamsChanged: boolean
  isLoading: boolean
  localQuoteTimestamp: number | null
}

export const DEFAULT_TRADE_QUOTE_STATE: TradeQuoteState = {
  quote: null,
  bridgeQuote: null,
  fetchParams: null,
  error: null,
  hasParamsChanged: false,
  isLoading: false,
  localQuoteTimestamp: null,
}

export const tradeQuotesAtom = atom<Record<SellTokenAddress, TradeQuoteState | undefined>>({})

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = _sellTokenAddress.toLowerCase()
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Don't update state if Fast quote finished after Optimal quote
      if (
        prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp &&
        nextState.quote &&
        nextState.fetchParams?.priceQuality === PriceQuality.FAST
      ) {
        return { ...prevState }
      }

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quote: typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote,
        localQuoteTimestamp: nextState.quote ? Math.ceil(Date.now() / 1000) : null,
      }

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)
