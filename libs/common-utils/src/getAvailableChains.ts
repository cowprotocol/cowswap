import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getAvailableChains(chainsToSkip: SupportedChainId[] = []): SupportedChainId[] {
  if (chainsToSkip.length === 0) {
    return Object.keys(CHAIN_INFO).map((chain) => +chain)
  }

  return Object.keys(CHAIN_INFO)
    .filter((chain) => !chainsToSkip.includes(+chain))
    .map((chain) => +chain)
}
