import type { AppKitNetwork } from '@reown/appkit/networks'

import { RWA_CHAIN_IDS } from '@/entities/asset'
import { getEvmChainInfo, toViemChain } from '@/shared/lib/chain'

const [defaultChain, ...otherChains] = RWA_CHAIN_IDS.flatMap((chainId) => getEvmChainInfo(chainId) ?? [])

export const DEFAULT_NETWORK: AppKitNetwork = toViemChain(defaultChain)

export const SUPPORTED_NETWORKS: [AppKitNetwork, ...AppKitNetwork[]] = [
  DEFAULT_NETWORK,
  ...otherChains.map(toViemChain),
]
