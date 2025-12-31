import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  RECENT_TOKENS_LIMIT,
  buildFavoriteTokenKeys,
  buildTokensByKey,
  getStoredTokenKey,
  insertToken,
  type StoredRecentTokensByChain,
  toStoredToken,
} from './recentTokensStorage'

import { recentTokensAtom } from '../state/recentTokensAtom'
import { getTokenUniqueKey } from '../utils/tokenKey'

interface UseRecentTokensParams {
  allTokens: TokenWithLogo[]
  favoriteTokens: TokenWithLogo[]
  activeChainId?: SupportedChainId
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
  const storedTokensByChain = useAtomValue<StoredRecentTokensByChain>(recentTokensAtom)
  const setStoredTokensByChain = useSetAtom(recentTokensAtom)

  const tokensByKey = useMemo(() => buildTokensByKey(allTokens), [allTokens])
  const favoriteKeys = useMemo(() => buildFavoriteTokenKeys(favoriteTokens), [favoriteTokens])

  const recentTokens = useMemo(() => {
    const chainEntries = activeChainId ? (storedTokensByChain[activeChainId] ?? []) : []
    const seenKeys = new Set<string>()
    const result: TokenWithLogo[] = []

    for (const entry of chainEntries) {
      const key = getStoredTokenKey(entry)

      if (seenKeys.has(key) || favoriteKeys.has(key)) {
        continue
      }

      const hydrated = tokensByKey.get(key)

      // Only surface recents that still exist in the current token set
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

      setStoredTokensByChain((prev: StoredRecentTokensByChain) => {
        const chainId = token.chainId as SupportedChainId
        const chainEntries = prev[chainId] ?? []
        const updatedChain = insertToken(chainEntries, toStoredToken(token), maxItems)

        return { ...prev, [chainId]: updatedChain }
      })
    },
    [favoriteKeys, maxItems, setStoredTokensByChain],
  )

  const clearRecentTokens = useCallback(() => {
    if (!activeChainId) {
      return
    }

    setStoredTokensByChain((prev: StoredRecentTokensByChain) => {
      const chainEntries = prev[activeChainId]

      if (!chainEntries?.length) {
        return prev
      }

      return { ...prev, [activeChainId]: [] }
    })
  }, [activeChainId, setStoredTokensByChain])

  return { recentTokens, addRecentToken, clearRecentTokens }
}
