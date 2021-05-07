import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { FeeInformation, QuoteInformationObject } from './reducer'

// UpdateQuoteParams is QuoteInformationObject but with the fee optional
export type UpdateQuoteParams = Omit<QuoteInformationObject, 'fee'> & {
  fee?: FeeInformation
}

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const clearQuote = createAction<ClearQuoteParams>('price/clearQuote')

// TODO: Add actions to update only the price
