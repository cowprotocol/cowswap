import { atom } from 'jotai'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

export interface LimitOrdersQuoteState {
  response?: OrderQuoteResponse
  error?: GpQuoteError
  isQuoteFinal: boolean
}

export const limitOrdersQuoteAtom = atom<LimitOrdersQuoteState>({ isQuoteFinal: false })
