import { atom } from 'jotai'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'

export interface LimitOrdersQuoteState {
  response?: SimpleGetQuoteResponse
  error?: GpQuoteError
}

export const limitOrdersQuoteAtom = atom<LimitOrdersQuoteState>({})
