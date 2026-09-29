import { useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Nullish } from 'types'

import { WrapUnwrapCallback, WrapUnwrapCallbackParams } from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useWrapNativeScreenState } from './useWrapNativeScreenState'

import { solanaWrapUnwrapCallback } from '../services/wrapNativeSolana/solanaWrapUnwrapCallback'

/**
 * Solana counterpart to `useWrapNativeCallback`.
 *
 * Returns `null` on every non-Solana chain, which is what lets `useWrapNativeFlow` keep delegating to
 * the EVM callback untouched.
 */

export function useSolanaWrapNativeCallback(amount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapCallback | null {
  const { chainId, account } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const addTransaction = useTransactionAdder()
  const [, setWrapNativeState] = useWrapNativeScreenState()
  const analytics = useCowAnalytics()

  return useMemo(() => {
    if (!isSolanaChain(chainId) || !account || !amount || !provider || !connection) {
      return null
    }

    return (params?: WrapUnwrapCallbackParams) =>
      solanaWrapUnwrapCallback(
        {
          account,
          amount,
          connection,
          provider,
          addTransaction,
          analytics,
          closeModals() {
            setWrapNativeState({ isOpen: false })
          },
          openTransactionConfirmationModal({ sendAmount, receiveAmount }) {
            setWrapNativeState({ isOpen: true, sendAmount, receiveAmount })
          },
          openErrorModal(errorMessage: string) {
            setWrapNativeState({ isOpen: true, errorMessage })
          },
        },
        params,
      )
  }, [chainId, account, amount, provider, connection, addTransaction, analytics, setWrapNativeState])
}
