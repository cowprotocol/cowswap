import { atom } from 'jotai'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export const DEFAULT_QUOTE_RESPONSE = {
  response: null,
  error: null,
  isLoading: false,
}
export interface TradeQuoteState {
  response: OrderQuoteResponse | null
  error: GpQuoteError | null
  isLoading: boolean
}

export const tradeQuoteAtom = atom<TradeQuoteState>(DEFAULT_QUOTE_RESPONSE)

export const updateTradeQuoteAtom = atom(null, (get, set, nextState: Partial<TradeQuoteState>) => {
  set(tradeQuoteAtom, () => {
    const prevState = get(tradeQuoteAtom)

    return { ...prevState, ...nextState }
  })
})
