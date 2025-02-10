import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { useWalletCapabilities } from './useWalletCapabilities'

import { useSafeAppsSdk } from '../../web3-react/hooks/useSafeAppsSdk'
import { useWalletInfo } from '../hooks'

export function useSendBatchTransactions(): (txs: MetaTransactionData[]) => Promise<string> {
  const safeAppsSdk = useSafeAppsSdk()
  const provider = useWalletProvider()
  const { chainId, account } = useWalletInfo()
  const { data: capabilities } = useWalletCapabilities()
  const isAtomicBatchSupported = !!capabilities?.atomicBatch?.supported

  return async (txs: MetaTransactionData[]) => {
    if (isAtomicBatchSupported && provider && account && chainId) {
      const chainIdHex = '0x' + (+chainId).toString(16)
      const calls = txs.map((tx) => ({ ...tx, chainId: chainIdHex }))

      return provider.send('wallet_sendCalls', [{ version: '1.0', from: account, calls }])
    }

    if (safeAppsSdk) {
      const tx = await safeAppsSdk.txs.send({ txs })

      return tx.safeTxHash
    } else {
      throw new Error('Batch transactions sending is not supported')
    }
  }
}
