import { ALL_SUPPORTED_CHAINS_MAP } from '@cowprotocol/cow-sdk'

import { SORTED_CHAIN_IDS } from './chainInfo'

export function getAvailableChainsText(): string {
  return SORTED_CHAIN_IDS.reduce((acc, chainId) => {
    const { label, isTestnet, isUnderDevelopment, isDeprecated } = ALL_SUPPORTED_CHAINS_MAP[chainId]
    if (!isUnderDevelopment && !isDeprecated) {
      acc.push(`${label}${isTestnet ? ' (testnet)' : ''}`)
    }
    return acc
  }, [] as string[])
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1')
}
