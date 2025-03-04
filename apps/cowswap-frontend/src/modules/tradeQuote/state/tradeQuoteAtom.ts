import { atom } from 'jotai'

import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'

import QuoteApiError from 'api/cowProtocol/errors/QuoteError'
import { FeeQuoteParams } from 'common/types'

import { tradeQuoteInputAtom } from './tradeQuoteInputAtom'

type SellTokenAddress = string

export interface TradeQuoteState {
  response: OrderQuoteResponse | null
  error: QuoteApiError | null
  isLoading: boolean
  hasParamsChanged: boolean
  quoteParams: FeeQuoteParams | null
  fetchStartTimestamp: number | null
  localQuoteTimestamp: number | null
}

export const DEFAULT_TRADE_QUOTE_STATE: TradeQuoteState = {
  response: null,
  error: null,
  isLoading: false,
  hasParamsChanged: false,
  quoteParams: null,
  fetchStartTimestamp: null,
  localQuoteTimestamp: null,
}

const tradeQuotesAtom = atom<Record<SellTokenAddress, TradeQuoteState>>({})

export const tradeQuoteAtom = atom<TradeQuoteState>((get) => {
  const { sellTokenAddress } = get(tradeQuoteInputAtom)
  const quotes = get(tradeQuotesAtom)

  return (sellTokenAddress && quotes[sellTokenAddress]) || DEFAULT_TRADE_QUOTE_STATE
})

export const updateTradeQuoteAtom = atom(
  null,
  (get, set, _sellTokenAddress: SellTokenAddress, nextState: Partial<TradeQuoteState>) => {
    set(tradeQuotesAtom, () => {
      const sellTokenAddress = _sellTokenAddress.toLowerCase()
      const prevState = get(tradeQuotesAtom)
      const prevQuote = prevState[sellTokenAddress] || DEFAULT_TRADE_QUOTE_STATE

      // Don't update state if Fast quote finished after Optimal quote
      if (
        prevQuote.fetchStartTimestamp === nextState.fetchStartTimestamp &&
        nextState.response &&
        nextState.quoteParams?.priceQuality === PriceQuality.FAST
      ) {
        return { ...prevState }
      }

      const update: TradeQuoteState = {
        ...prevQuote,
        ...nextState,
        quoteParams: typeof nextState.quoteParams === 'undefined' ? prevQuote.quoteParams : nextState.quoteParams,
        localQuoteTimestamp: nextState.response ? Math.ceil(Date.now() / 1000) : null,
      }

      return {
        ...prevState,
        [sellTokenAddress]: update,
      }
    })
  },
)
