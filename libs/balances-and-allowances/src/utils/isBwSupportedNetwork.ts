import { SupportedChainId } from '@cowprotocol/cow-sdk'

const BW_SUPPORTED_NETWORKS: Set<SupportedChainId> = new Set([
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.SEPOLIA,
])

export function isBwSupportedNetwork(chainId: SupportedChainId): boolean {
  return BW_SUPPORTED_NETWORKS.has(chainId)
}
