import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { FeeInformationObject } from './reducer'

export type AddFeeParams = FeeInformationObject

export interface ClearFeeParams {
  token: string // token address,
  chainId: ChainId
}

export const updateFee = createAction<AddFeeParams>('fee/updateFee')
export const clearFee = createAction<{ token: string; chainId: ChainId }>('fee/clearFee')
