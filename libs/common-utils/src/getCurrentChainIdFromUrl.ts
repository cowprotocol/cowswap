import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Maps chain names/slugs (used in URL path or query) to SupportedChainId.
 * Use this for resolving URL segments to chain IDs so we never compare by name.
 * Includes variants that may appear from external links or different UIs (e.g. "arbitrum-one", "sepolia").
 */
export const CHAIN_NAME_OR_SLUG_TO_ID: Record<string, SupportedChainId> = {
  mainnet: SupportedChainId.MAINNET,
  gnosis_chain: SupportedChainId.GNOSIS_CHAIN,
  gnosis: SupportedChainId.GNOSIS_CHAIN,
  sepolia: SupportedChainId.SEPOLIA,
  arbitrum: SupportedChainId.ARBITRUM_ONE,
  arbitrum_one: SupportedChainId.ARBITRUM_ONE, // 'arbitrum-one' resolved via .replace(/-/g, '_') fallback
  base: SupportedChainId.BASE,
  polygon: SupportedChainId.POLYGON,
  bnb: SupportedChainId.BNB,
  bsc: SupportedChainId.BNB,
  linea: SupportedChainId.LINEA,
  avalanche: SupportedChainId.AVALANCHE,
  lens: SupportedChainId.LENS,
  plasma: SupportedChainId.PLASMA,
  ink: SupportedChainId.INK,
}

/**
 * Resolves a URL path/query segment (chainId or chain name/slug) to SupportedChainId.
 * Always use this when reading chain from URL so comparisons are by numeric ID.
 */
export function parseChainIdFromUrlSegment(segment: string | undefined | null): SupportedChainId | null {
  if (!segment || typeof segment !== 'string') return null
  const trimmed = segment.toLowerCase().trim()
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed)
    return id in SupportedChainId ? (id as SupportedChainId) : null
  }
  return CHAIN_NAME_OR_SLUG_TO_ID[trimmed] ?? CHAIN_NAME_OR_SLUG_TO_ID[trimmed.replace(/-/g, '_')] ?? null
}

export function getCurrentChainIdFromUrl(location = window.location): SupportedChainId {
  return getRawCurrentChainIdFromUrl(location) || SupportedChainId.MAINNET
}

// Trying to get chainId from URL (#/100/swap or #/arbitrum/swap)
export function getRawCurrentChainIdFromUrl(location = window.location): SupportedChainId | null {
  const hash = location.hash
  // Match numeric chainId in path: #/42161 or #/42161/swap
  const numericMatch = hash.match(/^#\/(\d{1,9})(?:\/|\?|$)/)
  if (numericMatch?.[1]) {
    const id = Number(numericMatch[1])
    if (id in SupportedChainId) return id as SupportedChainId
  }
  // Match chain name/slug in path: #/arbitrum/swap or #/arbitrum-one/swap
  const pathSegment = hash.replace(/^#\//, '').split('/')[0]?.split('?')[0]
  const fromPathName = parseChainIdFromUrlSegment(pathSegment || '')
  if (fromPathName) return fromPathName

  const searchParams = new URLSearchParams(hash.split('?')[1])
  const chainQueryParam = searchParams.get('chain')
  const fromQuery = parseChainIdFromUrlSegment(chainQueryParam || '')
  if (fromQuery) return fromQuery

  return null
}
