import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = QuoteInformationObject

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export interface SetLoadingQuoteParams {
  // is it loading
  loading: boolean
  // indicator of a necessary hard load
  // e.g param changes: user changes token, input amt, etc
  quoteData: Pick<QuoteInformationObject, 'sellToken' | 'chainId'>
}

export type QuoteError =
  | 'fetch-quote-error'
  | 'insufficient-liquidity'
  | 'fee-exceeds-sell-amount'
  | 'unsupported-token'

export type SetQuoteErrorParams = UpdateQuoteParams & { error: QuoteError }

export const setNewQuoteLoading = createAction<SetLoadingQuoteParams>('price/setNewQuoteLoading')
export const setRefreshQuoteLoading = createAction<Pick<SetLoadingQuoteParams, 'loading'>>(
  'price/setRefreshQuoteLoading'
)
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const clearQuote = createAction<ClearQuoteParams>('price/clearQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')

// TODO: Add actions to update only the price
