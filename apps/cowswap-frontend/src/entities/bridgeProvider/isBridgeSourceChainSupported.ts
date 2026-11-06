import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'

// Solana is a bridge-only destination: you can bridge *to* it, but not *from* it (no source support yet)
const SOURCE_CHAINS_BRIDGE_DISABLED = new Set<number>([SupportedChainId.SOLANA])

export function isBridgeSourceChainSupported(
  chainId: number,
  bridgeSupportedNetworks: ChainInfo[] | undefined,
): boolean {
  if (SOURCE_CHAINS_BRIDGE_DISABLED.has(chainId)) return false

  return !!bridgeSupportedNetworks?.some((network) => network.id === chainId)
}
