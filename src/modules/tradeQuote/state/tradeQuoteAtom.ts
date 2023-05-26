import { atom } from 'jotai'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

export interface TradeQuoteState {
  response?: OrderQuoteResponse
  error?: GpQuoteError
  isLoading?: boolean
}

export const tradeQuoteAtom = atom<TradeQuoteState>({})
