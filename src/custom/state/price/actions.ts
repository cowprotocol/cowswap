import { createAction } from '@reduxjs/toolkit'
import { ApiErrorCodes } from 'utils/operator/error'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = QuoteInformationObject

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export type SetQuoteErrorParams = UpdateQuoteParams & { error: ApiErrorCodes }

export const setLoadingQuote = createAction<boolean>('price/setLoadingQuote')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const clearQuote = createAction<ClearQuoteParams>('price/clearQuote')
export const setQuoteError = createAction<SetQuoteErrorParams>('price/setQuoteError')

// TODO: Add actions to update only the price
