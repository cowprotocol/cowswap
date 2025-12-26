import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import ms from 'ms.macro'

import {
  RestrictedTokenListState,
  restrictedTokensAtom,
  restrictedTokensCacheAtom,
  restrictedTokensLastUpdateAtom,
} from '../state/restrictedTokens/restrictedTokensAtom'

const UPDATE_INTERVAL = ms`6h`

function isTimeToUpdate(lastUpdateTime: number): boolean {
  if (!lastUpdateTime) return true
  return Date.now() - lastUpdateTime > UPDATE_INTERVAL
}

interface UseRestrictedTokensCacheResult {
  shouldFetch: boolean
  saveToCache: (state: RestrictedTokenListState) => void
}

export function useRestrictedTokensCache(): UseRestrictedTokensCacheResult {
  const setRestrictedTokens = useSetAtom(restrictedTokensAtom)
  const setCache = useSetAtom(restrictedTokensCacheAtom)
  const cachedState = useAtomValue(restrictedTokensCacheAtom)
  const runtimeState = useAtomValue(restrictedTokensAtom)
  const lastUpdateTime = useAtomValue(restrictedTokensLastUpdateAtom)
  const setLastUpdateTime = useSetAtom(restrictedTokensLastUpdateAtom)

  const hasLoadedFromCache = useRef(false)

  // load cached data from IndexedDB into runtime state on mount
  useEffect(() => {
    if (cachedState.isLoaded && !hasLoadedFromCache.current) {
      hasLoadedFromCache.current = true
      setRestrictedTokens(cachedState)
    }
  }, [cachedState, setRestrictedTokens])

  const saveToCache = useCallback(
    (state: RestrictedTokenListState) => {
      setRestrictedTokens(state)
      setCache(state)
      setLastUpdateTime(Date.now())
    },
    [setRestrictedTokens, setCache, setLastUpdateTime],
  )

  // Should fetch if:
  // 1. Time-based update is needed, OR
  // 2. Runtime state is not loaded (no data available yet)
  const shouldFetch = isTimeToUpdate(lastUpdateTime) || !runtimeState.isLoaded

  return {
    shouldFetch,
    saveToCache,
  }
}
