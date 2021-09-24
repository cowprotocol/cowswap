import { useCallback, useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'

import { addTransaction, AddTransactionParams } from '../actions'
import { EnhancedTransactionDetails, HashType } from '../reducer'
import { useAllTransactions } from 'state/enhancedTransactions/hooks'
import { useWalletInfo } from '@src/custom/hooks/useWalletInfo'

export * from './TransactionHooksMod'

export type AddTransactionHookParams = Omit<AddTransactionParams, 'chainId' | 'from' | 'hashType'> // The hook requires less params for convenience
export type TransactionAdder = (params: AddTransactionHookParams) => void

/**
 * Return helpers to add a new pending transaction
 */
export function useTransactionAdder(): TransactionAdder {
  const { chainId, account, gnosisSafeInfo } = useWalletInfo()
  const dispatch = useAppDispatch()

  const isGnosisSafeWallet = !!gnosisSafeInfo

  return useCallback(
    (addTransactionParams: AddTransactionHookParams) => {
      if (!account || !chainId) return

      const { hash, summary, approval, presign, safeTransaction } = addTransactionParams
      const hashType = isGnosisSafeWallet ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX
      if (!hash) {
        throw Error('No transaction hash found')
      }
      dispatch(addTransaction({ hash, hashType, from: account, chainId, approval, summary, presign, safeTransaction }))
    },
    [dispatch, chainId, account, isGnosisSafeWallet]
  )
}

type TransactionFilter = (tx: EnhancedTransactionDetails) => boolean

/**
 * Return all transactions details
 */
export function useAllTransactionsDetails(filter?: TransactionFilter): EnhancedTransactionDetails[] {
  const transactions = useAllTransactions()

  return useMemo(() => {
    const transactionsDetails = Object.keys(transactions).map((hash) => transactions[hash])

    return filter ? transactionsDetails.filter(filter) : transactionsDetails
  }, [transactions, filter])
}

export type TransactionsByType = Record<HashType, EnhancedTransactionDetails[]>

/**
 * Return all transactions grouped by type
 */
export function useAllTransactionsByType(filter?: TransactionFilter): TransactionsByType {
  const transactions = useAllTransactionsDetails(filter)

  return useMemo(() => {
    return transactions.reduce<TransactionsByType>(
      (acc, tx) => {
        const txs = acc[tx.hashType]
        if (!txs) {
          acc[tx.hashType] = []
        }
        acc[tx.hashType].push(tx)
        return acc
      },
      {
        [HashType.ETHEREUM_TX]: [],
        [HashType.GNOSIS_SAFE_TX]: [],
      }
    )
  }, [transactions])
}

/**
 * Return all transaction hashes
 */
export function useAllTransactionHashes(filter?: TransactionFilter): string[] {
  const transactions = useAllTransactionsDetails(filter)

  return useMemo(() => transactions.map((tx) => tx.hash), [transactions])
}
