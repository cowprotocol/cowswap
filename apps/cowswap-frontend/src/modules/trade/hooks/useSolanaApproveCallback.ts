import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { allowancesAtom } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Nullish } from 'types'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { SOLANA_MAX_APPROVE_AMOUNT } from '../services/solanaApprove/const'
import { solanaApproveCallback } from '../services/solanaApprove/solanaApproveCallback'

export type SolanaApproveCallback = (amount?: bigint) => Promise<{ hash: string } | null>

/**
 * Solana counterpart to the EVM approve callback. Returns `null` on every non-Solana chain (and until a
 * Solana wallet is connected), which lets callers keep delegating to the EVM approve untouched.
 *
 * The returned callback delegates `amount` (default unlimited, `SOLANA_MAX_APPROVE_AMOUNT`, with the
 * parameter left open for partial approvals later). Once the approval confirms, the delegation is
 * written into `allowancesAtom` optimistically so the trade form leaves its "approve required" state
 * immediately, without waiting for the next delegation refetch.
 */
export function useSolanaApproveCallback(token: Nullish<TokenWithLogo>): SolanaApproveCallback | null {
  const { chainId, account } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const addTransaction = useTransactionAdder()
  const setAllowances = useSetAtom(allowancesAtom)

  return useMemo(() => {
    if (!isSolanaChain(chainId) || !account || !token || !provider || !connection) {
      return null
    }

    return async (amount: bigint = SOLANA_MAX_APPROVE_AMOUNT) => {
      const result = await solanaApproveCallback({ account, token, amount, connection, provider, addTransaction })

      if (result) {
        setAllowances((state) => ({
          ...state,
          [chainId]: { ...state[chainId], [getAddressKey(token.address)]: amount },
        }))
      }

      return result
    }
  }, [chainId, account, token, provider, connection, addTransaction, setAllowances])
}
