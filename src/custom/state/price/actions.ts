import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = Omit<QuoteInformationObject, 'lastCheck'>

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export type GetQuoteParams = Pick<QuoteInformationObject, 'sellToken' | 'chainId'>

export type QuoteError =
  | 'fetch-quote-error'
  | 'insufficient-liquidity'
  | 'fee-exceeds-sell-amount'
  | 'unsupported-token'

export type SetQuoteErrorParams = UpdateQuoteParams & { error: QuoteError }

export const getNewQuoteStart = createAction<GetQuoteParams>('price/getNewQuoteStart')
export const refreshQuoteStart = createAction('price/refreshQuoteStart')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')
