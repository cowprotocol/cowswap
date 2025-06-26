import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsSafeWallet, useIsWalletConnect } from '@cowprotocol/wallet'
import SafeApiKit from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCallback } from 'common/hooks/useApproveCallback'
import { useSafeApiKit } from 'common/hooks/useSafeApiKit'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { pollUntil } from 'common/utils/pollUntil'

import { zeroApprovalState } from '../state/zeroApprovalState'

async function waitForSafeTransactionExecution({
  safeApiKit,
  txHash,
}: {
  safeApiKit: SafeApiKit
  txHash: string
}): Promise<SafeMultisigTransactionResponse | null> {
  return await pollUntil(
    async () => {
      try {
        return await safeApiKit.getTransaction(txHash)
      } catch {
        return null
      }
    },
    (transaction: SafeMultisigTransactionResponse | null) => {
      return transaction ? !transaction.isExecuted : true
    },
    1000,
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useZeroApprove(currency: Currency | undefined) {
  const setZeroApprovalState = useSetAtom(zeroApprovalState)
  const spender = useTradeSpenderAddress()
  const amountToApprove = currency ? CurrencyAmount.fromRawAmount(currency, 0) : undefined
  const approveCallback = useApproveCallback(amountToApprove, spender)
  const safeApiKit = useSafeApiKit()
  const isWalletConnect = useIsWalletConnect()
  const isSafeWallet = useIsSafeWallet()

  return useCallback(async () => {
    try {
      setZeroApprovalState({ isApproving: true, currency })
      const txReceipt = await approveCallback()

      // For Wallet Connect based Safe Wallet connections, wait for transaction to be executed.
      if (txReceipt && safeApiKit && isSafeWallet && isWalletConnect) {
        await waitForSafeTransactionExecution({ safeApiKit, txHash: txReceipt.hash })
      }
    } finally {
      setZeroApprovalState({ isApproving: false })
    }
  }, [approveCallback, setZeroApprovalState, currency, safeApiKit, isSafeWallet, isWalletConnect])
}
