import type { Config } from 'wagmi'
import { getConnection, getPublicClient, getWalletClient, switchChain } from 'wagmi/actions'

import { TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'

import { APP_CODE } from '@/shared/config'

/** `soft` signs an off-chain cancellation, `hard` sends an on-chain transaction */
export type CancellationType = 'soft' | 'hard'

export interface CancelOrderParams {
  config: Config
  chainId: number
  orderUid: string
  type: CancellationType
}

// TradingSdk keeps its adapter in a global that onChainCancelOrder re-reads after awaiting the order lookup,
// so overlapping cancellations would sign with the adapter of whichever started last
let queue: Promise<unknown> = Promise.resolve()

/** Resolves with the transaction hash of a hard cancellation, `null` for a soft one */
export function cancelOrder(params: CancelOrderParams): Promise<string | null> {
  const result = queue.then(() => submitCancellation(params))

  queue = result.catch(() => undefined)

  return result
}

async function submitCancellation({ config, chainId, orderUid, type }: CancelOrderParams): Promise<string | null> {
  if (getConnection(config).chainId !== chainId) await switchChain(config, { chainId })

  const publicClient = getPublicClient(config, { chainId })

  if (!publicClient) throw new Error(`Network ${chainId} is not supported`)

  const walletClient = await getWalletClient(config, { chainId })
  const sdk = new TradingSdk(
    { chainId, appCode: APP_CODE },
    {},
    new ViemAdapter({ provider: publicClient, walletClient }),
  )

  if (type === 'soft') {
    await sdk.offChainCancelOrder({ orderUid })

    return null
  }

  return sdk.onChainCancelOrder({ orderUid })
}
