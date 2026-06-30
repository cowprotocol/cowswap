import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { FiniteMap } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { custom, createPublicClient, http, type EIP1193Provider, type PublicClient } from 'viem'

import { isEip1193Provider } from './isEip1193Provider.utils'

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

interface CustomClientCacheEntry {
  client: PublicClient
  provider: EIP1193Provider
}

const customClientsCache = new FiniteMap<EvmChains, CustomClientCacheEntry>(16)

export function getPublicClientFromEIP1193Provider(chainId: EvmChains, provider: EIP1193Provider): PublicClient {
  const cached = customClientsCache.get(chainId)

  if (cached?.provider === provider) return cached.client

  const client = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: custom(provider),
  })

  customClientsCache.set(chainId, { client, provider })

  return client
}

export function getPublicClientFromProvider(chainId: EvmChains, provider?: unknown): PublicClient {
  return provider && isEip1193Provider(provider)
    ? getPublicClientFromEIP1193Provider(chainId, provider)
    : getPublicClient(chainId)
}
