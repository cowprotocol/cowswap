import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import {
  RECENT_TOKENS_LIMIT,
  buildFavoriteTokenKeys,
  buildNextStoredTokens,
  buildTokensByKey,
  getStoredTokenKey,
  hydrateStoredToken,
  type StoredRecentTokensByChain,
} from './recentTokensStorage'

import { recentTokensAtom } from '../state/recentTokensAtom'
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
  maxItems = RECENT_TOKENS_LIMIT,
}: UseRecentTokensParams): RecentTokensState {
  const storedTokensByChain = useAtomValue(recentTokensAtom)
  const setStoredTokensByChain = useSetAtom(recentTokensAtom)

  const tokensByKey = useMemo(() => buildTokensByKey(allTokens), [allTokens])
  const favoriteKeys = useMemo(() => buildFavoriteTokenKeys(favoriteTokens), [favoriteTokens])

  // Filter out favorite tokens from stored tokens
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
  }, [favoriteKeys, setStoredTokensByChain])

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
        return buildNextStoredTokens(prev, token, maxItems)
      })
    },
    [favoriteKeys, maxItems, setStoredTokensByChain],
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

      return { ...prev, [activeChainId]: [] }
    })
  }, [activeChainId, setStoredTokensByChain])

  return { recentTokens, addRecentToken, clearRecentTokens }
}
