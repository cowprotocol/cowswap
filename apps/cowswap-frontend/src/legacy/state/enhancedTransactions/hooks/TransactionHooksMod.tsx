import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppSelector } from '../../hooks'
import { EnhancedTransactionDetails } from '../reducer'

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: EnhancedTransactionDetails } {
  const { chainId } = useWalletInfo()

  const state = useAppSelector((state) => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()

  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx || tx.receipt || tx.replacementType || tx.errorMessage) return false

        const approval = tx.approval
        if (!approval) return false

        return (
          approval.spender.toLowerCase() === spender.toLowerCase() &&
          approval.tokenAddress.toLowerCase() === tokenAddress
        )
      }),
    [allTransactions, spender, tokenAddress]
  )
}
