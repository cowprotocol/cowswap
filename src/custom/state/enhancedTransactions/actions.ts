import { SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { createAction } from '@reduxjs/toolkit'
import { SerializableTransactionReceipt } from '@src/state/transactions/actions'
import { EnhancedTransactionDetails } from './reducer'

type WithChainId = { chainId: number }

export type AddTransactionParams = WithChainId &
  Pick<
    EnhancedTransactionDetails,
    'hash' | 'hashType' | 'from' | 'approval' | 'presign' | 'summary' | 'safeTransaction'
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

export type ReplacementType = 'speedup' | 'cancel'

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
