import { atom } from 'jotai'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export interface AdvancedOrdersQuoteState {
  response?: OrderQuoteResponse
  error?: GpQuoteError
  isLoading?: boolean
}

export const advancedOrdersQuoteAtom = atom<AdvancedOrdersQuoteState>({})
