import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { useIsSafeWallet, useIsWalletConnect } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { TransactionReceipt } from '@ethersproject/abstract-provider'
import SafeApiKit from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useApproveCallback } from 'modules/erc20Approve'

import { useSafeApiKit } from 'common/hooks/useSafeApiKit'
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

export function useZeroApprove(
  currency: Currency | undefined,
): () => Promise<TransactionReceipt | null | SafeMultisigTransactionResponse | undefined> {
  const setZeroApprovalState = useSetAtom(zeroApprovalState)
  const spender = useTradeSpenderAddress()
  const amountToApprove = currency ? CurrencyAmount.fromRawAmount(currency, 0) : undefined
  const approveCallback = useApproveCallback(amountToApprove?.currency, spender)
  const safeApiKit = useSafeApiKit()
  const isWalletConnect = useIsWalletConnect()
  const isSafeWallet = useIsSafeWallet()
  const provider = useWalletProvider()

  return useCallback(async () => {
    if (!amountToApprove) return

    try {
      setZeroApprovalState({ isApproving: true, currency })
      const txReceipt = await approveCallback(amountToApprove)

      // For Wallet Connect based Safe Wallet connections, wait for transaction to be executed.
      if (txReceipt && safeApiKit && isSafeWallet && isWalletConnect) {
        return waitForSafeTransactionExecution({ safeApiKit, txHash: txReceipt.hash })
      } else {
        return provider && txReceipt ? provider.waitForTransaction(txReceipt?.hash) : null
      }
    } finally {
      setZeroApprovalState({ isApproving: false })
    }
  }, [
    amountToApprove,
    setZeroApprovalState,
    currency,
    approveCallback,
    safeApiKit,
    isSafeWallet,
    isWalletConnect,
    provider,
  ])
}
