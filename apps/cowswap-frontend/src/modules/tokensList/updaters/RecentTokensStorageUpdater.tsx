import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { getTokenId } from '@cowprotocol/common-utils'
import { useFavoriteTokens } from '@cowprotocol/tokens'

import { recentTokensStorageAtom } from '../state/recentTokensStorageAtom'
import { persistStoredTokens, StoredRecentTokensByChain } from '../utils/recentTokensStorage'

/**
 * Updater that handles side-effects for recent tokens storage:
 * - Persists to localStorage when state changes
 * - Removes tokens that became favorites
 */
export function RecentTokensStorageUpdater(): null {
  const [storedTokensByChain, setStoredTokensByChain] = useAtom(recentTokensStorageAtom)
  const favoriteTokens = useFavoriteTokens()

  // Track if this is the initial render to skip persistence on mount
  const isInitialRender = useRef(true)

  // Persist to localStorage when state changes (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    persistStoredTokens(storedTokensByChain)
  }, [storedTokensByChain])

  // Remove tokens that became favorites
  useEffect(() => {
    const favoriteKeys = new Set(favoriteTokens.map((token) => getTokenId(token)))

    setStoredTokensByChain((prev) => {
      const nextEntries: StoredRecentTokensByChain = {}
      let didChange = false

      for (const [chainKey, tokens] of Object.entries(prev)) {
        const chainId = Number(chainKey)
        const filtered = tokens.filter((token) => !favoriteKeys.has(getTokenId(token)))

        if (filtered.length) {
          nextEntries[chainId] = filtered
        }

        didChange = didChange || filtered.length !== tokens.length
      }

      return didChange ? nextEntries : prev
    })
  }, [favoriteTokens, setStoredTokensByChain])

  return null
}
