import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import {
  getStoredTokenKey,
  hydrateStoredToken,
  RECENT_TOKENS_LIMIT,
  type StoredRecentTokensByChain,
} from '../utils/recentTokensStorage'

interface UseHydratedRecentTokensParams {
  storedTokensByChain: StoredRecentTokensByChain
  tokensByKey: Map<string, TokenWithLogo>
  favoriteKeys: Set<string>
  activeChainId?: number
  maxItems?: number
}

export function useHydratedRecentTokens({
  storedTokensByChain,
  tokensByKey,
  favoriteKeys,
  activeChainId,
  maxItems = RECENT_TOKENS_LIMIT,
}: UseHydratedRecentTokensParams): TokenWithLogo[] {
  return useMemo(() => {
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
}
