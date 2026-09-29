import { type Chain, createPublicClient, defineChain, fallback, http, type PublicClient } from 'viem'

import { type EvmChainInfo, getChainInfo, isEvmChainInfo } from '@cowprotocol/cow-sdk'

import { WALLET_CONNECT_PROJECT_ID } from '@/shared/config'

const RPC_TIMEOUT_MS = 5_000

const publicClients = new Map<number, PublicClient>()

export function getChainLabel(chainId: number): string {
  return getChainInfo(chainId)?.label ?? `Chain ${chainId}`
}

export function getEvmChainInfo(chainId: number): EvmChainInfo | undefined {
  const chain = getChainInfo(chainId)

  return chain && isEvmChainInfo(chain) ? chain : undefined
}

export function getExplorerTxUrl(chainId: number, txHash: string): string | null {
  const chain = getChainInfo(chainId)

  return chain ? `${chain.blockExplorer.url}/tx/${txHash}` : null
}

export function getPublicClient(chainId: number): PublicClient | null {
  const cached = publicClients.get(chainId)

  if (cached) return cached

  const chain = getEvmChainInfo(chainId)

  if (!chain) return null

  // The SDK default RPCs are public and rate limited (eth.merkle.io answers with Cloudflare error 1015), so they are only a fallback
  const rpcUrls = [getReownRpcUrl(chain.id), ...chain.rpcUrls.default.http]
  const transport = fallback(
    rpcUrls.map((url) => http(url, { batch: true, timeout: RPC_TIMEOUT_MS, retryCount: 0 })),
    { retryCount: 0 },
  )
  const client = createPublicClient({ chain: toViemChain(chain), transport })
  publicClients.set(chainId, client)

  return client
}

export function toViemChain(chain: EvmChainInfo): Chain {
  return defineChain({
    id: chain.id,
    name: chain.label,
    nativeCurrency: {
      name: chain.nativeCurrency.name ?? chain.nativeCurrency.symbol ?? chain.label,
      symbol: chain.nativeCurrency.symbol ?? '',
      decimals: chain.nativeCurrency.decimals,
    },
    rpcUrls: { default: { http: chain.rpcUrls.default.http } },
    blockExplorers: { default: { name: chain.blockExplorer.name, url: chain.blockExplorer.url } },
    testnet: chain.isTestnet,
    contracts: chain.contracts.multicall3 ? { multicall3: chain.contracts.multicall3 } : undefined,
  })
}

function getReownRpcUrl(chainId: number): string {
  return `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${WALLET_CONNECT_PROJECT_ID}`
}
