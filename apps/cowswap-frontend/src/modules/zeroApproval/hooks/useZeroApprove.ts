import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsSafeWallet, walletConnectConnectionV2 } from '@cowprotocol/wallet'
import SafeApiKit from '@safe-global/api-kit'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'

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
    1000
  )
}

export function useZeroApprove(currency: Currency) {
  const setZeroApprovalState = useSetAtom(zeroApprovalState)
  const spender = useTradeSpenderAddress()
  const amountToApprove = CurrencyAmount.fromRawAmount(currency, 0)
  const approveCallback = useApproveCallback(amountToApprove, spender)
  const safeApiKit = useSafeApiKit()
  const isWalletConnect = useIsActiveWallet(walletConnectConnectionV2)
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
