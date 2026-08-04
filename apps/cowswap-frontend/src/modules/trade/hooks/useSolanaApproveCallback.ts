import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { allowancesAtom } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Nullish } from 'types'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useSolanaApproveScreenState } from './useSolanaApproveScreenState'

import { SOLANA_MAX_APPROVE_AMOUNT } from '../services/solanaApprove/const'
import { solanaApproveCallback } from '../services/solanaApprove/solanaApproveCallback'

export type SolanaApproveCallback = (amount?: bigint) => Promise<{ hash: string } | null>

/**
 * Solana counterpart to the EVM approve callback. Returns `null` on every non-Solana chain (and until a
 * Solana wallet is connected), which lets callers keep delegating to the EVM approve untouched.
 *
 * The returned callback delegates `amount` (default unlimited, `SOLANA_MAX_APPROVE_AMOUNT`, with the
 * parameter left open for partial approvals later), driving the shared Solana pending/error modal via
 * `solanaApproveStateAtom`. Once the approval succeeds, the delegation is written into `allowancesAtom`
 * optimistically so the trade form leaves its "approve required" state without waiting for a refetch.
 */
export function useSolanaApproveCallback(token: Nullish<TokenWithLogo>): SolanaApproveCallback | null {
  const { chainId, account } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const addTransaction = useTransactionAdder()
  const setAllowances = useSetAtom(allowancesAtom)
  const [, setSolanaApproveState] = useSolanaApproveScreenState()

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
        modals: {
          openTransactionConfirmationModal() {
            setSolanaApproveState({ isOpen: true, tokenSymbol: token.symbol })
          },
          openErrorModal(errorMessage: string) {
            setSolanaApproveState({ isOpen: true, tokenSymbol: token.symbol, errorMessage })
          },
          closeModals() {
            setSolanaApproveState({ isOpen: false })
          },
        },
      })

      if (result) {
        setAllowances((state) => ({
          ...state,
          [chainId]: { ...state[chainId], [getAddressKey(token.address)]: approveAmount },
        }))
      }

      return result
    }
  }, [chainId, account, token, provider, connection, addTransaction, setAllowances, setSolanaApproveState])
}
