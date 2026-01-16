import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'

import { recentTokensStorageAtom } from '../state/recentTokensStorageAtom'
import {
  buildNextStoredTokens,
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

/**
 * Hook that provides recent tokens storage state and callbacks.
 * Side-effects (persistence, favorites sync) are handled by RecentTokensStorageUpdater.
 */
export function useRecentTokensStorage({
  favoriteKeys,
  maxItems = RECENT_TOKENS_LIMIT,
}: UseRecentTokensStorageParams): RecentTokensStorageState {
  const [storedTokensByChain, setStoredTokensByChain] = useAtom(recentTokensStorageAtom)

  const addRecentToken = useCallback(
    (token: TokenWithLogo) => {
      if (favoriteKeys.has(getTokenId(token))) return

      setStoredTokensByChain((prev) => buildNextStoredTokens(prev, token, maxItems))
    },
    [favoriteKeys, maxItems, setStoredTokensByChain],
  )

  const clearRecentTokens = useCallback(
    (chainId: number) => {
      setStoredTokensByChain((prev) => {
        if (!prev[chainId]?.length) return prev
        return { ...prev, [chainId]: [] }
      })
    },
    [setStoredTokensByChain],
  )

  return useMemo(
    () => ({ storedTokensByChain, addRecentToken, clearRecentTokens }),
    [storedTokensByChain, addRecentToken, clearRecentTokens],
  )
}
