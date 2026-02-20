import { SORTED_CHAIN_IDS } from '@cowprotocol/common-const'
import { isChainDeprecated, SupportedChainId } from '@cowprotocol/cow-sdk'

const DEPRECATED_CHAINS_IDS = SORTED_CHAIN_IDS.filter(isChainDeprecated)

export function getDeprecatedChains(chainsToSkip: SupportedChainId[] = []): SupportedChainId[] {
  if (chainsToSkip.length === 0) {
    return DEPRECATED_CHAINS_IDS
  }

  return DEPRECATED_CHAINS_IDS.filter((chain) => !chainsToSkip.includes(chain))
}
