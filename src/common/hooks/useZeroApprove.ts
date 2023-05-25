import { useCallback } from 'react'
import { useTradeSpenderAddress } from './useTradeSpenderAddress'
import { useApproveCallback } from './useApproveCallback'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useSetAtom } from 'jotai'
import { zeroApprovalState } from '../state/useZeroApprovalState'
import { useSafeApiKit } from 'api/gnosisSafe/hooks/useSafeApiKit'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { useIsActiveWallet } from 'legacy/hooks/useIsActiveWallet'
import { walletConnectConnection } from 'modules/wallet/web3-react/connection/walletConnect'
import { useIsSafeWallet } from 'modules/wallet'
import { pollUntil } from 'common/utils/pollUntil'
import SafeApiKit from '@safe-global/api-kit'

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
  const isWalletConnect = useIsActiveWallet(walletConnectConnection)
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
