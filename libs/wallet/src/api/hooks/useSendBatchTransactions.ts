import { useCallback } from 'react'

import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { useWalletCapabilities } from './useWalletCapabilities'

import { useSafeAppsSdk } from '../../web3-react/hooks/useSafeAppsSdk'
import { useWalletInfo } from '../hooks'

export type SendBatchTxCallback = (txs: MetaTransactionData[]) => Promise<string>

export function useSendBatchTransactions(): SendBatchTxCallback {
  // TODO this will be fixed in M-3 COW-569
  const safeAppsSdk = useSafeAppsSdk()
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const { data: capabilities } = useWalletCapabilities()
  const isAtomicBatchSupported = capabilities?.atomic?.status === 'supported'

  return useCallback(
    async (txs: MetaTransactionData[]) => {
      if (isAtomicBatchSupported && provider && account && chainId) {
        const chainIdHex = '0x' + (+chainId).toString(16)
        const calls = txs.map((tx) => ({ ...tx, chainId: chainIdHex }))

        return provider
          .send('wallet_sendCalls', [{ version: '1.0', from: account, calls, chainId: chainIdHex }])
          .then((res) => {
            return typeof res === 'string' ? res : res.id
          })
      }

      if (safeAppsSdk) {
        const tx = await safeAppsSdk.txs.send({ txs })

        return tx.safeTxHash
      } else {
        throw new Error('Batch transactions sending is not supported')
      }
    },
    [isAtomicBatchSupported, provider, account, chainId, safeAppsSdk],
  )
}
