import { ALL_SUPPORTED_CHAINS } from '@cowprotocol/cow-sdk'

export function getAvailableChainsText(): string {
  return ALL_SUPPORTED_CHAINS.filter(({ isUnderDevelopment }) => !isUnderDevelopment)
    .map(({ label, isTestnet }) => `${label}${isTestnet ? ' (testnet)' : ''}`)
    .sort()
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1')
}
