import { SupportedChainId } from '@cowprotocol/cow-sdk'

export function getCurrentChainIdFromUrl(): SupportedChainId {
  // Trying to get chainId from URL (#/100/swap)
  // eslint-disable-next-line no-restricted-globals
  const { location } = window
  const urlChainIdMatch = location.hash.match(/^#\/(\d{1,9})\D/)
  const chainId = +(
    (urlChainIdMatch ? urlChainIdMatch[1] : new URLSearchParams(location.hash.split('?')[1]).get('chain')) || ''
  )

  if (chainId && chainId in SupportedChainId) return chainId

  return SupportedChainId.MAINNET
}
