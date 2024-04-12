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
}
export interface TradeQuoteState {
  response: OrderQuoteResponse | null
  error: GpQuoteError | null
  isLoading: boolean
  quoteParams: LegacyFeeQuoteParams | null
}

export const tradeQuoteAtom = atomWithReset<TradeQuoteState>(DEFAULT_QUOTE_RESPONSE)

export const updateTradeQuoteAtom = atom(null, (get, set, nextState: Partial<TradeQuoteState>) => {
  set(tradeQuoteAtom, () => {
    const prevState = get(tradeQuoteAtom)

    return { ...prevState, ...nextState }
  })
})
