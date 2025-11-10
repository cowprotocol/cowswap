import { useCallback, useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { getTokenUniqueKey } from '../utils/tokenKey'

export const RECENT_TOKENS_LIMIT = 4
export const RECENT_TOKENS_STORAGE_KEY = 'select-token-widget:recent-tokens:v1'

interface StoredRecentToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
  logoURI?: string
  tags?: string[]
}

interface UseRecentTokensParams {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  maxItems?: number
}

export interface RecentTokensState {
  recentTokens: TokenWithLogo[]
  addRecentToken(token: TokenWithLogo): void
}

export function useRecentTokens({
  allTokens,
  favoriteTokens,
  maxItems = RECENT_TOKENS_LIMIT,
}: UseRecentTokensParams): RecentTokensState {
  const [storedTokens, setStoredTokens] = useState<StoredRecentToken[]>(() => readStoredTokens(maxItems))

  useEffect(() => {
    persistStoredTokens(storedTokens)
  }, [storedTokens])

  const tokensByKey = useMemo(() => buildTokensByKey(allTokens), [allTokens])
  const favoriteKeys = useMemo(() => buildFavoriteTokenKeys(favoriteTokens), [favoriteTokens])

  useEffect(() => {
    setStoredTokens((prev) => {
      const filtered = prev.filter((token) => !favoriteKeys.has(getStoredTokenKey(token)))

      return filtered.length === prev.length ? prev : filtered
    })
  }, [favoriteKeys])

  const recentTokens = useMemo(() => {
    const seenKeys = new Set<string>()
    const result: TokenWithLogo[] = []

    for (const entry of storedTokens) {
      const key = getStoredTokenKey(entry)

      if (seenKeys.has(key) || favoriteKeys.has(key)) {
        continue
      }

      const hydrated = hydrateStoredToken(entry, tokensByKey.get(key))

      if (hydrated) {
        result.push(hydrated)
        seenKeys.add(key)
      }

      if (result.length >= maxItems) {
        break
      }
    }

    return result
  }, [favoriteKeys, maxItems, storedTokens, tokensByKey])

  const addRecentToken = useCallback(
    (token: TokenWithLogo) => {
      if (favoriteKeys.has(getTokenUniqueKey(token))) {
        return
      }

      setStoredTokens((prev) => {
        const next = buildNextStoredTokens(prev, token, maxItems)

        persistStoredTokens(next)

        return next
      })
    },
    [favoriteKeys, maxItems],
  )

  return { recentTokens, addRecentToken }
}

export function persistRecentTokenSelection(
  token: TokenWithLogo,
  favoriteTokens: TokenWithLogo[],
  maxItems = RECENT_TOKENS_LIMIT,
): void {
  const favoriteKeys = buildFavoriteTokenKeys(favoriteTokens)

  if (favoriteKeys.has(getTokenUniqueKey(token))) {
    return
  }

  const current = readStoredTokens(maxItems)
  const next = buildNextStoredTokens(current, token, maxItems)

  persistStoredTokens(next)
}

function buildTokensByKey(tokens: TokenWithLogo[]): Map<string, TokenWithLogo> {
  const map = new Map<string, TokenWithLogo>()

  for (const token of tokens) {
    map.set(getTokenUniqueKey(token), token)
  }

  return map
}

function buildFavoriteTokenKeys(tokens: TokenWithLogo[]): Set<string> {
  const set = new Set<string>()

  for (const token of tokens) {
    set.add(getTokenUniqueKey(token))
  }

  return set
}

function hydrateStoredToken(entry: StoredRecentToken, canonical?: TokenWithLogo): TokenWithLogo | null {
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

function getStoredTokenKey(token: StoredRecentToken): string {
  return getTokenUniqueKey(token)
}

function readStoredTokens(limit: number): StoredRecentToken[] {
  if (!canUseLocalStorage()) {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_TOKENS_STORAGE_KEY)

    if (!rawValue) {
      return []
    }

    const parsed: unknown = JSON.parse(rawValue)

    if (!Array.isArray(parsed)) {
      return []
    }

    const sanitized = parsed
      .map<StoredRecentToken | null>((item) => sanitizeStoredToken(item))
      .filter((item): item is StoredRecentToken => Boolean(item))

    return sanitized.slice(0, limit)
  } catch {
    return []
  }
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

function persistStoredTokens(tokens: StoredRecentToken[]): void {
  if (!canUseLocalStorage()) {
    return
  }

  try {
    window.localStorage.setItem(RECENT_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // Ignore persistence errors – the feature is best-effort only
  }
}

function buildNextStoredTokens(prev: StoredRecentToken[], token: TokenWithLogo, maxItems: number): StoredRecentToken[] {
  const normalized = toStoredToken(token)
  const key = getStoredTokenKey(normalized)
  const withoutToken = prev.filter((entry) => getStoredTokenKey(entry) !== key)

  return [normalized, ...withoutToken].slice(0, maxItems)
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}
