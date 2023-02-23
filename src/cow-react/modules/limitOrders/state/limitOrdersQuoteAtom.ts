import { atom } from 'jotai'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'
import { SimpleGetQuoteResponse } from '@cow/types'

export interface LimitOrdersQuoteState {
  response?: SimpleGetQuoteResponse
  error?: GpQuoteError
}

export const limitOrdersQuoteAtom = atom<LimitOrdersQuoteState>({})
