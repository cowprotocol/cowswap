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
 * Returns `null` on every non-Solana chain (and until a Solana wallet is connected), so callers keep
 * using the EVM approve untouched.
 *
 * The returned callback delegates `amount` (default unlimited, `SOLANA_MAX_APPROVE_AMOUNT`) and is
 * modal-less: it resolves to `{ hash }` on success, `null` on user rejection, and rethrows on any other
 * error — the caller (trade widget / tokens page) owns the pending/error UI, reusing the same EVM approve
 * modal. On success the delegation is written into `allowancesAtom` optimistically so consumers leave
 * their "approve required" state without waiting for a refetch.
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
      const approveAmount = amount > SOLANA_MAX_APPROVE_AMOUNT ? SOLANA_MAX_APPROVE_AMOUNT : amount

      const result = await solanaApproveCallback({
        account,
        token,
        amount: approveAmount,
        connection,
        provider,
        addTransaction,
      })

      if (result) {
        setAllowances((state) => ({
          ...state,
          [chainId]: { ...state[chainId], [getAddressKey(token.address)]: approveAmount },
        }))
      }

      return result
    }
  }, [chainId, account, token, provider, connection, addTransaction, setAllowances])
}
