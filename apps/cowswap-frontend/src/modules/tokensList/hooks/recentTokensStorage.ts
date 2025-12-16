import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getTokenUniqueKey } from '../utils/tokenKey'

export const RECENT_TOKENS_LIMIT = 4
export const RECENT_TOKENS_STORAGE_KEY = 'selectTokenWidget:recentTokens:v0'

export interface StoredRecentToken {
  chainId: SupportedChainId
  address: string
  decimals: number
  symbol?: string
  name?: string
  logoURI?: string
  tags?: string[]
}

export type StoredRecentTokensByChain = Partial<Record<SupportedChainId, StoredRecentToken[]>> &
  Record<number, StoredRecentToken[] | undefined>

const SUPPORTED_CHAIN_IDS = new Set(
  Object.values(SupportedChainId).filter((value): value is SupportedChainId => typeof value === 'number'),
)

function isSupportedChainId(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.has(chainId as SupportedChainId)
}

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

export function getStoredTokenKey(token: StoredRecentToken): string {
  return getTokenUniqueKey(token)
}

export function sanitizeStoredTokensMap(record: Record<string, unknown>, limit: number): StoredRecentTokensByChain {
  const entries: StoredRecentTokensByChain = {} as StoredRecentTokensByChain

  for (const [chainKey, tokens] of Object.entries(record)) {
    const chainId = Number(chainKey)

    if (!isSupportedChainId(chainId) || !Array.isArray(tokens)) {
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
  if (!isStoredRecentTokenInput(token)) {
    return null
  }

  const { chainId, address, decimals, symbol, name, logoURI, tags } = token

  if (!isSupportedChainId(chainId)) {
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

type StoredRecentTokenCandidate = Omit<StoredRecentToken, 'chainId'> & { chainId: number }

function isStoredRecentTokenInput(token: unknown): token is StoredRecentTokenCandidate {
  if (!token || typeof token !== 'object') {
    return false
  }

  const candidate = token as StoredRecentTokenCandidate

  return (
    typeof candidate.chainId === 'number' &&
    typeof candidate.address === 'string' &&
    typeof candidate.decimals === 'number'
  )
}

export function insertToken(tokens: StoredRecentToken[], token: StoredRecentToken, limit: number): StoredRecentToken[] {
  const key = getTokenUniqueKey(token)
  const withoutToken = tokens.filter((entry) => getTokenUniqueKey(entry) !== key)

  return [token, ...withoutToken].slice(0, limit)
}

export function toStoredToken(token: TokenWithLogo): StoredRecentToken {
  return {
    chainId: token.chainId as SupportedChainId,
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

  return {} as StoredRecentTokensByChain
}
