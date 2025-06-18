import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { createAction } from '@reduxjs/toolkit'

import { EnhancedTransactionDetails } from './reducer'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

type WithChainId = { chainId: number }
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithData = { data?: any }

export type AddTransactionParams = WithChainId &
  WithData &
  Pick<
    EnhancedTransactionDetails,
    | 'hash'
    | 'hashType'
    | 'nonce'
    | 'from'
    | 'approval'
    | 'presign'
    | 'claim'
    | 'summary'
    | 'safeTransaction'
    | 'swapVCow'
    | 'swapLockedGNOvCow'
    | 'ethFlow'
    | 'onChainCancellation'
  >

export const addTransaction = createAction<AddTransactionParams>('enhancedTransactions/addTransaction')

export const clearAllTransactions = createAction<WithChainId>('enhancedTransactions/clearAllTransactions')

export const finalizeTransaction = createAction<{
  chainId: number
  hash: string
  receipt: SerializableTransactionReceipt
  safeTransaction?: SafeMultisigTransactionResponse
}>('enhancedTransactions/finalizeTransaction')

export const checkedTransaction = createAction<{
  chainId: number
  hash: string
  blockNumber: number
}>('enhancedTransactions/checkedTransaction')

export type ReplacementType = 'speedup' | 'cancel' | 'replaced'

export const replaceTransaction = createAction<{
  chainId: number
  oldHash: string
  newHash: string
  type: ReplacementType
}>('enhancedTransactions/replaceTransaction')

export const updateSafeTransaction = createAction<{
  chainId: number
  safeTransaction: SafeMultisigTransactionResponse
  blockNumber: number
}>('enhancedTransactions/updateSafeTransaction')
