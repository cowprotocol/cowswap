import { useCallback } from 'react'

import type { MetaTransactionData } from '@safe-global/types-kit'

import { useConfig } from 'wagmi'
import { sendCalls } from 'wagmi/actions'

import { useWalletCapabilities } from './useWalletCapabilities'

import { useSafeAppsSdk } from '../../wagmi/hooks/useSafeAppsSdk'
import { useWalletInfo } from '../hooks'

import type { Hex } from 'viem'

export type SendBatchTxCallback = (txs: MetaTransactionData[]) => Promise<string>

export function useSendBatchTransactions(): SendBatchTxCallback {
  const config = useConfig()
  const safeAppsSdk = useSafeAppsSdk()
  const { chainId, account } = useWalletInfo()
  const { data: capabilities } = useWalletCapabilities()
  const isAtomicBatchSupported = capabilities?.atomic?.status === 'supported'

  return useCallback(
    async (txs: MetaTransactionData[]) => {
      if (isAtomicBatchSupported && account && chainId) {
        const calls = txs.map(({ to, value, data }) => ({ to, value: BigInt(value), data: data as Hex }))

        return sendCalls(config, {
          account,
          calls,
          chainId,
        }).then((res) => res.id)
      }

      if (safeAppsSdk) {
        const tx = await safeAppsSdk.txs.send({ txs })

        return tx.safeTxHash
      } else {
        throw new Error('Batch transactions sending is not supported')
      }
    },
    [isAtomicBatchSupported, config, account, chainId, safeAppsSdk],
  )
}
