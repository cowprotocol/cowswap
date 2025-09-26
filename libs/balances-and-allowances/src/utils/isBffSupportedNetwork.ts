import { SupportedChainId } from '@cowprotocol/cow-sdk'

const UNSUPPORTED_BFF_NETWORKS = [SupportedChainId.LENS]

export function isBffSupportedNetwork(chainId: SupportedChainId): boolean {
  return !UNSUPPORTED_BFF_NETWORKS.includes(chainId)
}
