import { createAction } from '@reduxjs/toolkit'

import { QuoteInformationObject } from './reducer'
import { LegacyFeeQuoteParams } from './types'

export type UpdateQuoteParams = Omit<QuoteInformationObject, 'lastCheck'>

export type GetQuoteParams = LegacyFeeQuoteParams
export type RefreshQuoteParams = { sellToken: string; chainId: number }

export type QuoteError =
  | 'fetch-quote-error'
  | 'insufficient-liquidity'
  | 'fee-exceeds-sell-amount'
  | 'unsupported-token'
  | 'offline-browser'
  | 'zero-price'
  | 'transfer-eth-to-smart-contract'

export type SetQuoteErrorParams = UpdateQuoteParams & { error?: QuoteError }

export const getNewQuote = createAction<GetQuoteParams>('price/getNewQuote')
export const refreshQuote = createAction<RefreshQuoteParams>('price/refreshQuote')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')
