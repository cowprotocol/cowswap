import { useCallback, useMemo } from 'react'

import { useWalletInfo, useIsSafeWallet } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useAllTransactions } from './TransactionHooksMod'

import { useAppDispatch } from '../../hooks'
import { addTransaction, AddTransactionParams } from '../actions'
import { EnhancedTransactionDetails, HashType } from '../reducer'

export * from './TransactionHooksMod'

export type AddTransactionHookParams = Omit<AddTransactionParams, 'chainId' | 'from' | 'hashType' | 'nonce'> // The hook requires less params for convenience
export type TransactionAdder = (params: AddTransactionHookParams) => void

/**
 * Return helpers to add a new pending transaction
 */
export function useTransactionAdder(): TransactionAdder {
  const { chainId, account } = useWalletInfo()
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()
  const dispatch = useAppDispatch()
  const isSafeWallet = useIsSafeWallet()

  return useCallback(
    async (addTransactionParams: AddTransactionHookParams) => {
      if (!account) return

      const hashType = isSafeWallet ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX

      if (!addTransactionParams.hash) {
        throw Error('No transaction hash found')
      }

      if (!provider) return

      try {
        const nonce = await provider.getTransactionCount(account)

        dispatch(
          addTransaction({
            hashType,
            from: account,
            chainId,
            ...addTransactionParams,
            nonce,
          }),
        )
      } catch (e) {
        console.error('Cannot add a transaction', e)
      }
    },
    [dispatch, chainId, account, isSafeWallet, provider],
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
