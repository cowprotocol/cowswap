import { defineChain } from 'viem'

import { ALL_SUPPORTED_CHAINS, type EvmChainInfo, isEvmChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import type { AppKitNetwork } from '@reown/appkit/networks'

function toAppKitNetwork(chain: EvmChainInfo): AppKitNetwork {
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
  })
}

const evmChains = ALL_SUPPORTED_CHAINS.filter(isEvmChainInfo)
const mainnet = evmChains.find((chain) => chain.id === SupportedChainId.MAINNET) ?? evmChains[0]

export const DEFAULT_NETWORK = toAppKitNetwork(mainnet)

export const SUPPORTED_NETWORKS: [AppKitNetwork, ...AppKitNetwork[]] = [
  DEFAULT_NETWORK,
  ...evmChains.filter((chain) => chain !== mainnet).map(toAppKitNetwork),
]
