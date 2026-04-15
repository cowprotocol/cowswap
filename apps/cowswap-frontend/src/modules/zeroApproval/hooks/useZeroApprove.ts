import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Nullish } from '@cowprotocol/types'
import { useIsSafeWallet, useIsWalletConnect } from '@cowprotocol/wallet'
import type SafeApiKit from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

import { usePublicClient } from 'wagmi'

import { useApproveCallback } from 'modules/erc20Approve'

import { useSafeApiKit } from 'common/hooks/useSafeApiKit'
import { pollUntil } from 'common/utils/pollUntil'

import { zeroApprovalState } from '../state/zeroApprovalState'

export type ZeroApproveReceipt = Awaited<
  ReturnType<NonNullable<ReturnType<typeof usePublicClient>>['waitForTransactionReceipt']>
>

export function useZeroApprove(
  currency: Currency | undefined,
): () => Promise<Nullish<ZeroApproveReceipt | SafeMultisigTransactionResponse>> {
  const setZeroApprovalState = useSetAtom(zeroApprovalState)
  const spender = useTradeSpenderAddress()
  const amountToApprove = currency ? CurrencyAmount.fromRawAmount(currency, 0) : undefined
  const approveCallback = useApproveCallback(amountToApprove?.currency, spender)
  const publicClient = usePublicClient()
  const safeApiKit = useSafeApiKit()
  const isWalletConnect = useIsWalletConnect()
  const isSafeWallet = useIsSafeWallet()

  return useCallback(async () => {
    if (!amountToApprove) return

    try {
      setZeroApprovalState({ isApproving: true, currency })
      const txResult = await approveCallback(amountToApprove)

      // For Wallet Connect based Safe Wallet connections, wait for transaction to be executed.
      if (txResult && safeApiKit && isSafeWallet && isWalletConnect) {
        return waitForSafeTransactionExecution({ safeApiKit, txHash: txResult.hash })
      }
      if (txResult && publicClient) {
        return publicClient.waitForTransactionReceipt({ hash: txResult.hash })
      }
      return undefined
    } finally {
      setZeroApprovalState({ isApproving: false })
    }
  }, [
    amountToApprove,
    setZeroApprovalState,
    currency,
    approveCallback,
    publicClient,
    safeApiKit,
    isSafeWallet,
    isWalletConnect,
  ])
}

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
