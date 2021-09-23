import { createAction } from '@reduxjs/toolkit'

export const cancelTransaction = createAction<{
  chainId: number
  hash: string
}>('transactions/cancelTransaction')

export const replaceTransaction = createAction<{
  chainId: number
  oldHash: string
  newHash: string
}>('transactions/replaceTransaction')
