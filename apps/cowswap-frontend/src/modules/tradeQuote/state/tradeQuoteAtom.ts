import { atom } from 'jotai'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import type { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import QuoteApiError from 'api/cowProtocol/errors/QuoteError'

export interface TradeQuoteState {
  response: OrderQuoteResponse | null
  error: QuoteApiError | null
  isLoading: boolean
  hasParamsChanged: boolean
  quoteParams: LegacyFeeQuoteParams | null
  localQuoteTimestamp: number | null
}

export const DEFAULT_TRADE_QUOTE_STATE: TradeQuoteState = {
  response: null,
  error: null,
  isLoading: false,
  hasParamsChanged: false,
  quoteParams: null,
  localQuoteTimestamp: null,
}

export const tradeQuoteAtom = atom<TradeQuoteState>(DEFAULT_TRADE_QUOTE_STATE)

export const updateTradeQuoteAtom = atom(null, (get, set, nextState: Partial<TradeQuoteState>) => {
  set(tradeQuoteAtom, () => {
    const prevState = get(tradeQuoteAtom)

    return {
      ...prevState,
      ...nextState,
      quoteParams: typeof nextState.quoteParams === 'undefined' ? prevState.quoteParams : nextState.quoteParams,
      localQuoteTimestamp: nextState.response ? Math.ceil(Date.now() / 1000) : null,
    }
  })
})
