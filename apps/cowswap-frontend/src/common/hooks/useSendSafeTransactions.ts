import { isTruthy } from '@cowprotocol/common-utils'
import { useSafeAppsSdk, useWalletCapabilities } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

type GetCallsResult = {
  status: 'PENDING' | 'CONFIRMED'
  receipts?: {
    logs: {
      address: `0x${string}`
      data: `0x${string}`
      topics: `0x${string}`[]
    }[]
    status: `0x${string}` // Hex 1 or 0 for success or failure, respectively
    chainId: `0x${string}`
    blockHash: `0x${string}`
    blockNumber: `0x${string}`
    gasUsed: `0x${string}`
    transactionHash: `0x${string}`
  }[]
}

export function useSendSafeTransactions() {
  const safeAppsSdk = useSafeAppsSdk()
  const provider = useWalletProvider()
  const { address: account } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  const capabilities = useWalletCapabilities()
  const isAtomicBatchSupported = !!capabilities?.atomicBatch?.supported

  return async function sendSafeTransaction(txs: MetaTransactionData[]): Promise<string> {
    if (isAtomicBatchSupported && provider && account && chainId) {
      const chainIdHex = '0x' + (+chainId).toString(16)

      return provider
        .send('wallet_sendCalls', [
          { version: '1.0', from: account, calls: txs.map((tx) => ({ ...tx, chainId: chainIdHex })) },
        ])
        .then((batchId) => {
          return new Promise((resolve, reject) => {
            let intervalId: NodeJS.Timer | null = null
            let triesCount = 0

            // TODO: store batchId into localStorage and monitor it in background
            function checkStatus() {
              if (!provider) return undefined

              return provider.send('wallet_getCallsStatus', [batchId]).then((response: GetCallsResult) => {
                triesCount++

                const safeTxHashes = response.receipts
                  ?.map((r) => {
                    const log = r.logs.find((l) => {
                      // ExecutionSuccess topic
                      return l.topics[0] === '0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e'
                    })

                    return log ? log.data.slice(0, 66) : undefined
                  })
                  .filter(isTruthy)

                const safeTxHash = safeTxHashes?.[0]

                if (response.status === 'CONFIRMED' && safeTxHash) {
                  resolve(safeTxHash)
                  if (intervalId) clearInterval(intervalId)
                }

                if (triesCount > 30) {
                  if (intervalId) clearInterval(intervalId)
                  reject(new Error('Cannot get batch transaction result'))
                }
              })
            }

            intervalId = setInterval(checkStatus, 1000)

            checkStatus()
          })
        })
    }

    if (safeAppsSdk) {
      const tx = await safeAppsSdk.txs.send({ txs })

      return tx.safeTxHash
    } else {
      throw new Error('Safe Apps SDK not available')
    }
  }
}
