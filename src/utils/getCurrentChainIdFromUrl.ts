import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getCurrentChainIdFromUrl(): SupportedChainId {
  // Trying to get chainId from URL (#/100/swap)
  // eslint-disable-next-line no-restricted-globals
  const urlChainIdMatch = location.hash.match(/^#\/(\d{1,9})\D/)
  const chainId = urlChainIdMatch && +urlChainIdMatch[1]

  if (chainId && chainId in SupportedChainId) return chainId

  return SupportedChainId.MAINNET
}
