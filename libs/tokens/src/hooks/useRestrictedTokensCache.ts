import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useReducer } from 'react'

import ms from 'ms.macro'

import {
  RestrictedTokenListState,
  restrictedTokensAtom,
  restrictedTokensLastUpdateAtom,
} from '../state/restrictedTokens/restrictedTokensAtom'

const UPDATE_INTERVAL = ms`6h`

export function isTimeToUpdate(lastUpdateTime: number): boolean {
  if (!Number.isFinite(lastUpdateTime) || lastUpdateTime <= 0) return true

  const cacheAge = Date.now() - lastUpdateTime

  if (cacheAge < 0) return true

  return cacheAge > UPDATE_INTERVAL
}

interface UseRestrictedTokensCacheResult {
  shouldFetch: boolean
  hasFreshCache: boolean
  saveToCache: (state: RestrictedTokenListState) => void
}

export function useRestrictedTokensCache(): UseRestrictedTokensCacheResult {
  const setRestrictedTokens = useSetAtom(restrictedTokensAtom)
  const runtimeState = useAtomValue(restrictedTokensAtom)
  const lastUpdateTime = useAtomValue(restrictedTokensLastUpdateAtom)
  const setLastUpdateTime = useSetAtom(restrictedTokensLastUpdateAtom)

  const [, forceRefresh] = useReducer((value: number) => value + 1, 0)
  const isUpdateNeeded = isTimeToUpdate(lastUpdateTime)
  const hasFreshCache = runtimeState.isLoaded && !isUpdateNeeded

  useEffect(() => {
    if (!Number.isFinite(lastUpdateTime) || lastUpdateTime <= 0) {
      return
    }

    const expiresIn = lastUpdateTime + UPDATE_INTERVAL - Date.now()

    if (expiresIn <= 0) {
      forceRefresh()
      return
    }

    const timeoutId = setTimeout(forceRefresh, expiresIn)

    return () => clearTimeout(timeoutId)
  }, [lastUpdateTime])

  const saveToCache = useCallback(
    (state: RestrictedTokenListState) => {
      setRestrictedTokens(state)
      setLastUpdateTime(Date.now())
    },
    [setRestrictedTokens, setLastUpdateTime],
  )

  // Should fetch if:
  // 1. Time-based update is needed, OR
  // 2. Runtime state is not loaded (no authoritative data available yet)
  const shouldFetch = isUpdateNeeded || !runtimeState.isLoaded

  return {
    shouldFetch,
    hasFreshCache,
    saveToCache,
  }
}
