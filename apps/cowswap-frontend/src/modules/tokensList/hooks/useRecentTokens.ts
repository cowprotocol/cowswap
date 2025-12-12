import { useCallback, useEffect, useMemo, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import {
  recentTokensLimit,
  buildFavoriteTokenKeys,
  buildNextStoredTokens,
  buildTokensByKey,
  getStoredTokenKey,
  hydrateStoredToken,
  persistRecentTokenSelection as persistRecentTokenSelectionInternal,
  persistStoredTokens,
  readStoredTokens,
  type StoredRecentTokensByChain,
} from './recentTokensStorage'

import { getTokenUniqueKey } from '../utils/tokenKey'

interface UseRecentTokensParams {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  activeChainId?: number
  maxItems?: number
}

export interface RecentTokensState {
  recentTokens: TokenWithLogo[]
  addRecentToken(token: TokenWithLogo): void
  clearRecentTokens(): void
}

export function useRecentTokens({
  allTokens,
  favoriteTokens,
  activeChainId,
  maxItems = recentTokensLimit,
}: UseRecentTokensParams): RecentTokensState {
  const [storedTokensByChain, setStoredTokensByChain] = useState<StoredRecentTokensByChain>(() =>
    readStoredTokens(maxItems),
  )

  useEffect(() => {
    persistStoredTokens(storedTokensByChain)
  }, [storedTokensByChain])

  const tokensByKey = useMemo(() => buildTokensByKey(allTokens), [allTokens])
  const favoriteKeys = useMemo(() => buildFavoriteTokenKeys(favoriteTokens), [favoriteTokens])

  useEffect(() => {
    setStoredTokensByChain((prev) => {
      const nextEntries: StoredRecentTokensByChain = {}
      let didChange = false

      for (const [chainKey, tokens] of Object.entries(prev)) {
        const chainId = Number(chainKey)
        const filtered = tokens.filter((token) => !favoriteKeys.has(getStoredTokenKey(token)))

        if (filtered.length) {
          nextEntries[chainId] = filtered
        }

        didChange = didChange || filtered.length !== tokens.length
      }

      return didChange ? nextEntries : prev
    })
  }, [favoriteKeys])

  const recentTokens = useMemo(() => {
    const chainEntries = activeChainId ? (storedTokensByChain[activeChainId] ?? []) : []
    const seenKeys = new Set<string>()
    const result: TokenWithLogo[] = []

    for (const entry of chainEntries) {
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
  }, [activeChainId, favoriteKeys, maxItems, storedTokensByChain, tokensByKey])

  const addRecentToken = useCallback(
    (token: TokenWithLogo) => {
      if (favoriteKeys.has(getTokenUniqueKey(token))) {
        return
      }

      setStoredTokensByChain((prev) => {
        const next = buildNextStoredTokens(prev, token, maxItems)

        persistStoredTokens(next)

        return next
      })
    },
    [favoriteKeys, maxItems],
  )

  const clearRecentTokens = useCallback(() => {
    if (!activeChainId) {
      return
    }

    setStoredTokensByChain((prev) => {
      const chainEntries = prev[activeChainId]

      if (!chainEntries?.length) {
        return prev
      }

      const next: StoredRecentTokensByChain = { ...prev, [activeChainId]: [] }
      persistStoredTokens(next)

      return next
    })
  }, [activeChainId])

  return { recentTokens, addRecentToken, clearRecentTokens }
}

export { persistRecentTokenSelectionInternal as persistRecentTokenSelection }
