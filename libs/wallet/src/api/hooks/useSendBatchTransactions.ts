import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import type { MetaTransactionData } from '@safe-global/types-kit'

import { useConfig } from 'wagmi'
import { sendCalls } from 'wagmi/actions'

import { useSafeAppsSdk } from '../../wagmi/hooks/useSafeAppsSdk'
import { useWalletInfo } from '../hooks'
import { isBundlingSupportedAtom } from '../state/walletCapabilitiesAtom'

import type { Hex } from 'viem'

export type SendBatchTxCallback = (txs: MetaTransactionData[]) => Promise<string>

export function useSendBatchTransactions(): SendBatchTxCallback {
  const config = useConfig()
  const safeAppsSdk = useSafeAppsSdk()
  const { chainId, account } = useWalletInfo()
  const isBundlingSupported = useAtomValue(isBundlingSupportedAtom)

  return useCallback(
    async (txs: MetaTransactionData[]) => {
      if (isBundlingSupported && account && chainId) {
        const calls = txs.map(({ to, value, data }) => ({
          to: to as Hex,
          value: BigInt(value),
          data: (data ?? '0x') as Hex,
        }))

        return sendCalls(config, {
          account,
          calls: calls as Parameters<typeof sendCalls>[1]['calls'],
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
    [isBundlingSupported, config, account, chainId, safeAppsSdk],
  )
}
