import { createAction } from '@reduxjs/toolkit'
import { FeeQuoteParams } from 'utils/operator'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = Omit<QuoteInformationObject, 'lastCheck'>

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export type GetQuoteStartParams = FeeQuoteParams
export type RefreshQuoteParams = Pick<GetQuoteStartParams, 'sellToken' | 'chainId'>

export type QuoteError =
  | 'fetch-quote-error'
  | 'insufficient-liquidity'
  | 'fee-exceeds-sell-amount'
  | 'unsupported-token'
  | 'offline-browser'

export type SetQuoteErrorParams = UpdateQuoteParams & { error?: QuoteError }

export const getNewQuoteStart = createAction<GetQuoteStartParams>('price/getNewQuoteStart')
export const refreshQuoteStart = createAction<RefreshQuoteParams>('price/refreshQuoteStart')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')
