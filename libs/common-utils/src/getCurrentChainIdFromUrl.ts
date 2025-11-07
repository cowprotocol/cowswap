import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Maps chain names used in URL query parameters to SupportedChainId
 * Those networks are the ones that existed before we started using chain IDs in the URL
 */
const chainNameToIdMap: { [key: string]: SupportedChainId } = {
  mainnet: SupportedChainId.MAINNET,
  gnosis_chain: SupportedChainId.GNOSIS_CHAIN,
  sepolia: SupportedChainId.SEPOLIA,
}

export function getCurrentChainIdFromUrl(location = window.location): SupportedChainId {
  return getRawCurrentChainIdFromUrl(location) || SupportedChainId.MAINNET
}

// Trying to get chainId from URL (#/100/swap)
export function getRawCurrentChainIdFromUrl(location = window.location): SupportedChainId | null {
  const urlChainIdMatch = location.hash.match(/^#\/(\d{1,9})\D/)
  const searchParams = new URLSearchParams(location.hash.split('?')[1])
  const chainQueryParam = searchParams.get('chain')

  const chainId = +(urlChainIdMatch?.[1] || chainNameToIdMap[chainQueryParam || ''] || '')

  if (chainId && chainId in SupportedChainId) return chainId

  return null
}
