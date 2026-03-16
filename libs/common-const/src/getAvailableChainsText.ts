import { ADDITIONAL_TARGET_CHAINS_MAP, ALL_SUPPORTED_CHAINS_MAP, isSupportedChain } from '@cowprotocol/cow-sdk'

import { SORTED_CHAIN_IDS } from './chainInfo'

export function getAvailableChainsText(): string {
  return SORTED_CHAIN_IDS.reduce((acc, chainId) => {
    const { label, isTestnet, isUnderDevelopment, isDeprecated } = isSupportedChain(chainId)
      ? ALL_SUPPORTED_CHAINS_MAP[chainId]
      : ADDITIONAL_TARGET_CHAINS_MAP[chainId]

    if (!isUnderDevelopment && !isDeprecated) {
      acc.push(`${label}${isTestnet ? ' (testnet)' : ''}`)
    }
    return acc
  }, [] as string[])
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1')
}
