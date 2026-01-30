import { SupportedChainId } from '@cowprotocol/cow-sdk'

// TODO: check before Plasma launch. Currently unsupported on 2025/10/20
const UNSUPPORTED_BFF_NETWORKS = new Set([
  SupportedChainId.LENS,
  SupportedChainId.SEPOLIA,
  SupportedChainId.PLASMA,
  SupportedChainId.INK,
])

export function isBffSupportedNetwork(chainId: SupportedChainId): boolean {
  return !UNSUPPORTED_BFF_NETWORKS.has(chainId)
}
