import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { FiniteMap } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { createPublicClient, http } from 'viem'

type PublicClient = ReturnType<typeof createPublicClient>

const publicClientsCache = new FiniteMap<EvmChains, PublicClient>(16)

// TODO: Replace apps/explorer/src/hooks/euler/client with this one.

export function getPublicClient(chainId: EvmChains): PublicClient {
  const cached = publicClientsCache.get(chainId)
  if (cached) return cached

  const client = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: http(RPC_URLS[chainId]),
  })

  publicClientsCache.set(chainId, client)
  return client
}
