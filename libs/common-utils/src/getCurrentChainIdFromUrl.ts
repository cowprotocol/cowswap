import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Maps chain names used in URL query parameters to SupportedChainId.
 * The names here must match the `name` field in CHAIN_INFO (libs/common-const/src/chainInfo.ts).
 */
const chainNameToIdMap: { [key: string]: SupportedChainId } = {
  mainnet: SupportedChainId.MAINNET,
  ethereum: SupportedChainId.MAINNET,
  bnb: SupportedChainId.BNB,
  base: SupportedChainId.BASE,
  arbitrum_one: SupportedChainId.ARBITRUM_ONE,
  polygon: SupportedChainId.POLYGON,
  avalanche: SupportedChainId.AVALANCHE,
  gnosis_chain: SupportedChainId.GNOSIS_CHAIN,
  linea: SupportedChainId.LINEA,
  plasma: SupportedChainId.PLASMA,
  ink: SupportedChainId.INK,
  sepolia: SupportedChainId.SEPOLIA,
  solana: SupportedChainId.SOLANA,
}

export function getCurrentChainIdFromUrl(location = window.location): SupportedChainId {
  return getRawCurrentChainIdFromUrl(location) || SupportedChainId.MAINNET
}

// Trying to get chainId from URL (#/100/swap)
export function getRawCurrentChainIdFromUrl(location = window.location): SupportedChainId | null {
  const urlChainIdMatch = location.hash.match(/^#\/(\d{1,16})\D/)
  const searchParams = new URLSearchParams(location.hash.split('?')[1])
  const chainQueryParam = searchParams.get('chain')

  const chainId = +(urlChainIdMatch?.[1] || chainNameToIdMap[chainQueryParam || ''] || '')

  if (chainId && chainId in SupportedChainId) return chainId

  return null
}
