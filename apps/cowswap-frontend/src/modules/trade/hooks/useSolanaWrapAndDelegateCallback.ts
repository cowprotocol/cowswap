import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Nullish } from 'types'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useSolanaDelegationAllowance } from 'common/hooks/useSolanaDelegationAllowance'

import { solanaNativeSwapCallback } from '../services/solanaFlow/solanaNativeSwapCallback'

export type SolanaWrapAndDelegateCallback = () => Promise<{ hash: string } | null>

// Returns null on every non-Solana chain, mirroring useSolanaWrapNativeCallback/useSolanaApproveCallback.
export function useSolanaWrapAndDelegateCallback(sellAmount: Nullish<bigint>): SolanaWrapAndDelegateCallback | null {
  const { chainId, account } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const addTransaction = useTransactionAdder()
  const currentDelegation = useSolanaDelegationAllowance(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address)

  return useMemo(() => {
    if (!isSolanaChain(chainId) || !account || !provider || !connection || !sellAmount) {
      return null
    }

    return () =>
      solanaNativeSwapCallback({
        account,
        connection,
        provider,
        addTransaction,
        sellAmount,
        currentDelegation: currentDelegation ?? 0n,
      })
  }, [chainId, account, provider, connection, sellAmount, addTransaction, currentDelegation])
}
