import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import { useHydratedRecentTokens } from './useHydratedRecentTokens'
import { useRecentTokensStorage } from './useRecentTokensStorage'

import {
  buildFavoriteTokenKeys,
  buildTokensByKey,
  persistRecentTokenSelection as persistRecentTokenSelectionInternal,
  RECENT_TOKENS_LIMIT,
} from '../utils/recentTokensStorage'

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
  const tokensByKey = useMemo(() => buildTokensByKey(allTokens), [allTokens])
  const favoriteKeys = useMemo(() => buildFavoriteTokenKeys(favoriteTokens), [favoriteTokens])

  const {
    storedTokensByChain,
    addRecentToken,
    clearRecentTokens: clearForChain,
  } = useRecentTokensStorage({
    favoriteKeys,
    maxItems,
  })

  const recentTokens = useHydratedRecentTokens({
    storedTokensByChain,
    tokensByKey,
    favoriteKeys,
    activeChainId,
    maxItems,
  })

  const clearRecentTokens = useCallback(() => {
    if (activeChainId) {
      clearForChain(activeChainId)
    }
  }, [activeChainId, clearForChain])

  return useMemo(
    () => ({ recentTokens, addRecentToken, clearRecentTokens }),
    [recentTokens, addRecentToken, clearRecentTokens],
  )
}

export { persistRecentTokenSelectionInternal as persistRecentTokenSelection }
