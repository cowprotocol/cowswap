import { ALL_SUPPORTED_CHAINS, isEvmChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

import type { AppKitNetwork } from '@reown/appkit/networks'

import { toViemChain } from '@/shared/lib/chain'

const evmChains = ALL_SUPPORTED_CHAINS.filter(isEvmChainInfo)
const mainnet = evmChains.find((chain) => chain.id === SupportedChainId.MAINNET) ?? evmChains[0]

export const DEFAULT_NETWORK: AppKitNetwork = toViemChain(mainnet)

export const SUPPORTED_NETWORKS: [AppKitNetwork, ...AppKitNetwork[]] = [
  DEFAULT_NETWORK,
  ...evmChains.filter((chain) => chain !== mainnet).map(toViemChain),
]
