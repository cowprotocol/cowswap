import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

const ENS_ENDING = '.eth'

export function getMainnetEnsError(): string {
  const mainnetLabel = getChainInfo(SupportedChainId.MAINNET)?.label || 'Mainnet'
  return `ENS names are only supported when sending from ${mainnetLabel} to ${mainnetLabel}`
}

export function hasEnsEnding(value: string): boolean {
  return value.toLowerCase().endsWith(ENS_ENDING)
}

// Check if address is dangerous (token contracts, etc)
export function isDangerousRecipient(
  recipient: string,
  sellTokenAddress?: string,
  buyTokenAddress?: string,
): string | null {
  const normalized = recipient.toLowerCase()

  if (sellTokenAddress && normalized === sellTokenAddress.toLowerCase()) {
    return 'Cannot send to the sell token contract address'
  }

  if (buyTokenAddress && normalized === buyTokenAddress.toLowerCase()) {
    return 'Cannot send to the buy token contract address'
  }

  return null
}

export { ENS_ENDING }
