import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppSelector } from '../../hooks'
import { EnhancedTransactionDetails } from '../reducer'

const EMPTY_TX_STATE = {}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: EnhancedTransactionDetails } {
  const { chainId } = useWalletInfo()

  const state = useAppSelector((state) => state.transactions)

  return chainId ? (state[chainId] ?? EMPTY_TX_STATE) : EMPTY_TX_STATE
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, approvalSpender?: string): boolean {
  const allTransactions = useAllTransactions()
  const spender = useTradeSpenderAddress()
  const targetSpender = approvalSpender ?? spender

  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof targetSpender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash]
        if (!tx || tx.receipt || tx.replacementType || tx.errorMessage) return false

        const approval = tx.approval
        if (!approval) return false

        return (
          areAddressesEqual(approval.spender, targetSpender) && areAddressesEqual(approval.tokenAddress, tokenAddress)
        )
      }),
    [allTransactions, targetSpender, tokenAddress],
  )
}
