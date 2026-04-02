import { SORTED_DST_CHAIN_IDS } from '@cowprotocol/common-const'
import { TargetChainId } from '@cowprotocol/cow-sdk'

export function getAvailableDestinationChains(chainsToSkip: TargetChainId[] = []): TargetChainId[] {
  if (chainsToSkip.length === 0) {
    return SORTED_DST_CHAIN_IDS
  }

  return SORTED_DST_CHAIN_IDS.filter((chain) => !chainsToSkip.includes(chain))
}
