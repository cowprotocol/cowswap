import { atom } from 'jotai'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export interface LimitOrdersQuoteState {
  response?: OrderQuoteResponse
  error?: GpQuoteError
}

export const limitOrdersQuoteAtom = atom<LimitOrdersQuoteState>({})
