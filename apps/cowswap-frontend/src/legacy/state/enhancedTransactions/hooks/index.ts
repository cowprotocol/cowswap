import { useCallback, useMemo } from 'react'

import { useWalletInfo, useIsSafeWallet } from '@cowprotocol/wallet'
import { useWeb3React } from '@web3-react/core'

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
  const { provider } = useWeb3React()
  const dispatch = useAppDispatch()
  const isSafeWallet = useIsSafeWallet()

  return useCallback(
    async (addTransactionParams: AddTransactionHookParams) => {
      if (!account || !chainId) return

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
          })
        )
      } catch (e) {
        console.error('Cannot add a transaction', e)
      }
    },
    [dispatch, chainId, account, isSafeWallet, provider]
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

// // watch for submissions to claim
// // return null if not done loading, return undefined if not found
// export function useUserHasSubmittedClaim(account?: string): {
//   claimSubmitted: boolean
//   claimTxn: EnhancedTransactionDetails | undefined
// } {
//   const pendingClaims = useAllClaimingTransactions()
//   const claimTxn = useMemo(
//     () =>
//       // find one that is both the user's claim, AND not mined
//       pendingClaims.find((claim) => claim.claim?.recipient === account),
//     [account, pendingClaims]
//   )

//   return { claimSubmitted: !!claimTxn, claimTxn }
// }
