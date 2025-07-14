import { SORTED_CHAIN_IDS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getAvailableChains(chainsToSkip: SupportedChainId[] = []): SupportedChainId[] {
  if (chainsToSkip.length === 0) {
    return SORTED_CHAIN_IDS
  }

  return SORTED_CHAIN_IDS.filter((chain) => !chainsToSkip.includes(chain))
}
