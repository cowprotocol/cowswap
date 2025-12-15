import { TokenWithLogo } from '@cowprotocol/common-const'

import { getTokenUniqueKey } from '../utils/tokenKey'

export const RECENT_TOKENS_LIMIT = 4
export const RECENT_TOKENS_STORAGE_KEY = 'selectTokenWidget:recentTokens:v0'

export interface StoredRecentToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  logoURI?: string
  tags?: string[]
}

export type StoredRecentTokensByChain = Record<number, StoredRecentToken[]>

export function buildTokensByKey(tokens: TokenWithLogo[]): Map<string, TokenWithLogo> {
  const map = new Map<string, TokenWithLogo>()

  for (const token of tokens) {
    map.set(getTokenUniqueKey(token), token)
  }

  return map
}

export function buildFavoriteTokenKeys(tokens: TokenWithLogo[]): Set<string> {
  const set = new Set<string>()

  for (const token of tokens) {
    set.add(getTokenUniqueKey(token))
  }

  return set
}

export function hydrateStoredToken(entry: StoredRecentToken, canonical?: TokenWithLogo): TokenWithLogo | null {
  if (canonical) {
    return canonical
  }

  try {
    return new TokenWithLogo(
      entry.logoURI,
      entry.chainId,
      entry.address,
      entry.decimals,
      entry.symbol,
      entry.name,
      undefined,
      entry.tags ?? [],
    )
  } catch {
    return null
  }
}

export function getStoredTokenKey(token: StoredRecentToken): string {
  return getTokenUniqueKey(token)
}

export function buildNextStoredTokens(
  prev: StoredRecentTokensByChain,
  token: TokenWithLogo,
  maxItems: number,
): StoredRecentTokensByChain {
  const chainId = token.chainId
  const normalized = toStoredToken(token)
  const chainEntries = prev[chainId] ?? []
  const updatedChain = insertToken(chainEntries, normalized, maxItems)

  return {
    ...prev,
    [chainId]: updatedChain,
  }
}

export function sanitizeStoredTokensMap(record: Record<string, unknown>, limit: number): StoredRecentTokensByChain {
  const entries: StoredRecentTokensByChain = {}

  for (const [chainKey, tokens] of Object.entries(record)) {
    const chainId = Number(chainKey)

    if (Number.isNaN(chainId) || !Array.isArray(tokens)) {
      continue
    }

    const sanitized = tokens
      .map<StoredRecentToken | null>((token) => sanitizeStoredToken(token))
      .filter((token): token is StoredRecentToken => Boolean(token))

    if (sanitized.length) {
      entries[chainId] = sanitized.slice(0, limit)
    }
  }

  return entries
}

function sanitizeStoredToken(token: unknown): StoredRecentToken | null {
  if (!token || typeof token !== 'object') {
    return null
  }

  const { chainId, address, decimals, symbol, name, logoURI, tags } = token as StoredRecentToken

  if (typeof chainId !== 'number' || typeof address !== 'string' || typeof decimals !== 'number') {
    return null
  }

  return {
    chainId,
    address: address.toLowerCase(),
    decimals,
    symbol: typeof symbol === 'string' ? symbol : undefined,
    name: typeof name === 'string' ? name : undefined,
    logoURI: typeof logoURI === 'string' ? logoURI : undefined,
    tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
  }
}

function insertToken(tokens: StoredRecentToken[], token: StoredRecentToken, limit: number): StoredRecentToken[] {
  const key = getTokenUniqueKey(token)
  const withoutToken = tokens.filter((entry) => getTokenUniqueKey(entry) !== key)

  return [token, ...withoutToken].slice(0, limit)
}

function toStoredToken(token: TokenWithLogo): StoredRecentToken {
  return {
    chainId: token.chainId,
    address: token.address.toLowerCase(),
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    logoURI: token.logoURI,
    tags: token.tags,
  }
}

export function normalizeStoredRecentTokens(stored: unknown, limit: number): StoredRecentTokensByChain {
  if (stored && typeof stored === 'object') {
    return sanitizeStoredTokensMap(stored as Record<string, unknown>, limit)
  }

  return {}
}
