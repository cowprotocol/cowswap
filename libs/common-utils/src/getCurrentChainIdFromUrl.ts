import { SupportedChainId } from '@cowprotocol/cow-sdk'

const chainNameToIdMap: { [key: string]: SupportedChainId } = {
  mainnet: SupportedChainId.MAINNET,
  gnosis_chain: SupportedChainId.GNOSIS_CHAIN,
  sepolia: SupportedChainId.SEPOLIA,
}

export function getCurrentChainIdFromUrl(): SupportedChainId {
  return getRawCurrentChainIdFromUrl() || SupportedChainId.MAINNET
}

export function getRawCurrentChainIdFromUrl(): SupportedChainId | null {
  // Trying to get chainId from URL (#/100/swap)

  const { location } = window
  const urlChainIdMatch = location.hash.match(/^#\/(\d{1,9})\D/)
  const searchParams = new URLSearchParams(location.hash.split('?')[1])
  const chainQueryParam = searchParams.get('chain')

  const chainId = +(urlChainIdMatch?.[1] || chainNameToIdMap[chainQueryParam || ''] || '')

  if (chainId && chainId in SupportedChainId) return chainId

  return null
}
