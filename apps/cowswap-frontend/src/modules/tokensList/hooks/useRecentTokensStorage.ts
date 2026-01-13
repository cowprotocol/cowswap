import { useCallback, useEffect, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'

import {
  buildNextStoredTokens,
  getStoredTokenKey,
  persistStoredTokens,
  readStoredTokens,
  RECENT_TOKENS_LIMIT,
  type StoredRecentTokensByChain,
} from '../utils/recentTokensStorage'

export interface RecentTokensStorageState {
  storedTokensByChain: StoredRecentTokensByChain
  addRecentToken: (token: TokenWithLogo) => void
  clearRecentTokens: (chainId: number) => void
}

interface UseRecentTokensStorageParams {
  favoriteKeys: Set<string>
  maxItems?: number
}

export function useRecentTokensStorage({
  favoriteKeys,
  maxItems = RECENT_TOKENS_LIMIT,
}: UseRecentTokensStorageParams): RecentTokensStorageState {
  const [storedTokensByChain, setStoredTokensByChain] = useState<StoredRecentTokensByChain>(() =>
    readStoredTokens(maxItems),
  )

  // Persist to localStorage when state changes
  useEffect(() => {
    persistStoredTokens(storedTokensByChain)
  }, [storedTokensByChain])

  // Remove tokens that became favorites
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

  const addRecentToken = useCallback(
    (token: TokenWithLogo) => {
      if (favoriteKeys.has(getTokenId(token))) return

      setStoredTokensByChain((prev) => {
        const next = buildNextStoredTokens(prev, token, maxItems)
        persistStoredTokens(next)
        return next
      })
    },
    [favoriteKeys, maxItems],
  )

  const clearRecentTokens = useCallback((chainId: number) => {
    setStoredTokensByChain((prev) => {
      if (!prev[chainId]?.length) return prev
      const next: StoredRecentTokensByChain = { ...prev, [chainId]: [] }
      persistStoredTokens(next)
      return next
    })
  }, [])

  return { storedTokensByChain, addRecentToken, clearRecentTokens }
}
