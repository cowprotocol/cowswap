import { useCallback, useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'

import { addTransaction, AddTransactionParams } from '../actions'
import { EnhancedTransactionDetails, HashType } from '../reducer'
import { useAllTransactions } from 'state/enhancedTransactions/hooks'
import { useWalletInfo } from 'hooks/useWalletInfo'

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

      const { hash, summary, data, claim, approval, presign, safeTransaction, swapVCow } = addTransactionParams
      const hashType = isGnosisSafeWallet ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX
      if (!hash) {
        throw Error('No transaction hash found')
      }
      dispatch(
        addTransaction({
          hash,
          hashType,
          from: account,
          chainId,
          approval,
          summary,
          claim,
          data,
          presign,
          safeTransaction,
          swapVCow,
        })
      )
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

type EnhancedTransactionDetailsMap = {
  [txHash: string]: EnhancedTransactionDetails
}

export function useTransactionsByHash({ hashes }: { hashes: string[] }): EnhancedTransactionDetailsMap {
  const allTxs = useAllTransactions()

  return useMemo(() => {
    if (!allTxs || !hashes) {
      return {}
    }

    return hashes.reduce<EnhancedTransactionDetailsMap>((acc, hash) => {
      if (allTxs[hash]) {
        acc[hash] = allTxs[hash]
      }
      return acc
    }, {})
  }, [allTxs, hashes])
}

export function useAllClaimingTransactions() {
  const transactionsMap = useAllTransactions()
  const transactions = Object.values(transactionsMap)

  return useMemo(() => {
    return transactions.filter((tx) => !!tx.claim)
  }, [transactions])
}

export function useAllClaimingTransactionIndices() {
  const claimingTransactions = useAllClaimingTransactions()
  return useMemo(() => {
    const flattenedClaimingTransactions = claimingTransactions.reduce<number[]>((acc, { claim, receipt }) => {
      if (claim && claim.indices && !receipt) {
        acc.push(...claim.indices)
      }
      return acc
    }, [])

    return new Set(flattenedClaimingTransactions)
  }, [claimingTransactions])
}
