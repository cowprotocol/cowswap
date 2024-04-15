import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import type { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export const DEFAULT_QUOTE_RESPONSE = {
  response: null,
  error: null,
  isLoading: false,
  quoteParams: null,
  quoteDate: null,
}
export interface TradeQuoteState {
  response: OrderQuoteResponse | null
  error: GpQuoteError | null
  isLoading: boolean
  quoteParams: LegacyFeeQuoteParams | null
  quoteDate: number | null
}

export const tradeQuoteAtom = atomWithReset<TradeQuoteState>(DEFAULT_QUOTE_RESPONSE)

export const updateTradeQuoteAtom = atom(null, (get, set, nextState: Partial<TradeQuoteState>) => {
  set(tradeQuoteAtom, () => {
    const prevState = get(tradeQuoteAtom)

    return {
      ...prevState,
      ...nextState,
      quoteParams: typeof nextState.quoteParams === 'undefined' ? prevState.quoteParams : nextState.quoteParams,
      quoteDate: nextState.response ? Math.ceil(Date.now() / 1000) : null,
    }
  })
})
