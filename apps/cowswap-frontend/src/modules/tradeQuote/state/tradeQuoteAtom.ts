import { atom } from 'jotai'

import { BridgeProviderQuoteError, BridgeQuoteResults, PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'

import { SellTokenAddress } from './tradeQuoteInputAtom'

import { TradeQuoteFetchParams } from '../types'

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

// Helper function to check if we should skip update due to Fast quote finishing after Optimal quote
function shouldSkipFastQuoteUpdate(prevQuote: TradeQuoteState, nextState: Partial<TradeQuoteState>): boolean {
  return (
    prevQuote.fetchParams?.fetchStartTimestamp === nextState.fetchParams?.fetchStartTimestamp &&
    !!nextState.quote &&
    nextState.fetchParams?.priceQuality === PriceQuality.FAST
  )
}

// Helper function to create the updated trade quote state
function createUpdatedTradeQuoteState(
  prevQuote: TradeQuoteState,
  nextState: Partial<TradeQuoteState>,
): TradeQuoteState {
  return {
    ...prevQuote,
    ...nextState,
    quote: typeof nextState.quote === 'undefined' ? prevQuote.quote : nextState.quote,
    localQuoteTimestamp: nextState.quote ? Math.ceil(Date.now() / 1000) : null,
    // Ensure loading state is properly managed during transitions
    isLoading: nextState.isLoading !== undefined ? nextState.isLoading : prevQuote.isLoading,
  }
}

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = _sellTokenAddress.toLowerCase()
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Don't update state if Fast quote finished after Optimal quote
      if (shouldSkipFastQuoteUpdate(prevQuote, nextState)) {
        return { ...prevState }
      }

      const update = createUpdatedTradeQuoteState(prevQuote, nextState)

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)
