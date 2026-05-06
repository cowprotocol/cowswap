import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createPublicClient, http } from 'viem'

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>()

export function getPublicClient(chainId: SupportedChainId): ReturnType<typeof createPublicClient> {
  const cached = clientCache.get(chainId)
  if (cached) return cached
  const client = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: http(RPC_URLS[chainId]),
  })
  clientCache.set(chainId, client)
  return client
}
