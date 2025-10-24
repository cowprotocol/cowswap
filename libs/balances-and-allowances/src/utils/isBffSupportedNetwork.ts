import { SupportedChainId } from '@cowprotocol/cow-sdk'

// TODO: check before Plasma launch. Currently unsupported on 2025/10/20
const UNSUPPORTED_BFF_NETWORKS = [SupportedChainId.LENS, SupportedChainId.SEPOLIA, SupportedChainId.PLASMA]

export function isBffSupportedNetwork(chainId: SupportedChainId): boolean {
  return !UNSUPPORTED_BFF_NETWORKS.includes(chainId)
}
