import { atom } from 'jotai'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export interface LimitOrdersQuoteState {
  response?: OrderQuoteResponse
  error?: GpQuoteError
}

export const limitOrdersQuoteAtom = atom<LimitOrdersQuoteState>({})
