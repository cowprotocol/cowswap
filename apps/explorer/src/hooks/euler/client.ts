import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { atom, getDefaultStore } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { createPublicClient, http } from 'viem'

type PublicClient = ReturnType<typeof createPublicClient>

const publicClientAtomFamily = atomFamily((_chainId: SupportedChainId) => atom<PublicClient | null>(null))

export function getPublicClient(chainId: SupportedChainId): PublicClient {
  const store = getDefaultStore()
  const clientAtom = publicClientAtomFamily(chainId)
  const cached = store.get(clientAtom)
  if (cached) return cached
  const client = createPublicClient({
    chain: VIEM_CHAINS[chainId],
    transport: http(RPC_URLS[chainId]),
  })
  store.set(clientAtom, client)
  return client
}
