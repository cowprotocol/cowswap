import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = QuoteInformationObject

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export const setLoadingQuote = createAction<boolean>('price/setLoadingQuote')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const clearQuote = createAction<ClearQuoteParams>('price/clearQuote')

// TODO: Add actions to update only the price
