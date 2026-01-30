import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getTokenAddressKey } from '@cowprotocol/common-utils'
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
export function useHasPendingApproval(tokenAddress: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  const spender = useTradeSpenderAddress()

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
          getTokenAddressKey(approval.spender) === getTokenAddressKey(spender) &&
          getTokenAddressKey(approval.tokenAddress) === getTokenAddressKey(tokenAddress)
        )
      }),
    [allTransactions, spender, tokenAddress],
  )
}
