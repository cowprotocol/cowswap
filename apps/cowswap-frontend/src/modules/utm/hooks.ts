import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { waitForAnalytics } from '@cowprotocol/analytics'
import { getUtmParams, cleanUpUtmParams, isInjectedWidget, UtmParams } from '@cowprotocol/common-utils'

import { Location, useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { utmAtom } from './state'

export function useInitializeUtm(): void {
  const navigate = useNavigate()
  const location = useLocation()
  const { search, pathname, hash } = location
  const currentLocation = useRef(location)
  const setUtm = useSetAtom(utmAtom)

  useLayoutEffect(() => {
    currentLocation.current = location
  }, [location])

  useLayoutEffect(() => {
    logUtmDebug('useInitializeUtm effect running:', {
      search,
      pathname,
      hash,
      windowLocationSearch: window.location.search,
      windowLocationHref: window.location.href,
    })

    const { utm, hasUtmParams, hasQueryParamsOutOfHashbang, searchParams } = extractUtmParams(search)

    if (hasUtmParams) {
      return processUtmParams(utm, setUtm, navigate, () => currentLocation.current)
    }

    logUtmDebug('No UTM params found, checking for cleanup', {})
    // Check if we need to clean up any remaining UTM parameters
    const newSearchParams = cleanUpUtmParams(searchParams)
    const newSearch = newSearchParams.toString()

    // Only navigate if there's actually a change needed
    const currentSearch = searchParams.toString()
    logUtmDebug('Cleanup check:', {
      currentSearch,
      newSearch,
      needsCleanup: newSearch !== currentSearch,
    })

    if (newSearch !== currentSearch) {
      logUtmDebug('Cleanup needed, processing...', {})
      handleUrlNavigation(newSearch, hasQueryParamsOutOfHashbang, navigate, pathname, hash)
    }

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - we only want this to run once on mount
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

/**
 * Extract and merge UTM parameters from both router and window search params
 */
function extractUtmParams(search: string): {
  utm: UtmParams
  hasUtmParams: boolean
  hasQueryParamsOutOfHashbang: boolean
  searchParams: URLSearchParams
} {
  // Check if there are query params in window.location.search (outside the hash)
  const hasQueryParamsOutOfHashbang = Boolean(window.location.search)

  // Always check both React Router search and window.location.search for UTM params
  const routerSearchParams = new URLSearchParams(search || '')
  const windowSearchParams = new URLSearchParams(window.location.search || '')

  // Get UTM params from both sources
  const routerUtm = getUtmParams(routerSearchParams)
  const windowUtm = getUtmParams(windowSearchParams)

  // Merge UTM params (window.location.search takes precedence for UTM params)
  const utm = { ...routerUtm, ...windowUtm }
  const hasUtmParams = Object.values(utm).filter(Boolean).length > 0

  // For cleanup, we need to check both sources
  const searchParams = hasQueryParamsOutOfHashbang ? windowSearchParams : routerSearchParams

  logUtmDebug('UTM processing state:', {
    hasQueryParamsOutOfHashbang,
    routerSearch: search,
    windowSearch: window.location.search,
    routerUtm,
    windowUtm,
    mergedUtm: utm,
    hasUtmParams,
    searchParamsString: searchParams.toString(),
  })

  return { utm, hasUtmParams, hasQueryParamsOutOfHashbang, searchParams }
}

/**
 * Handle hash-based navigation when UTM params are in main URL
 */
function handleHashBasedNavigation(newSearch: string, navigate: ReturnType<typeof useNavigate>): void {
  // When UTM params are in the main URL, we need to move to hash-based routing
  // Parse the current hash to extract route and existing query params
  const currentHash = window.location.hash
  const [hashPath, hashQuery] = currentHash.substring(1).split('?') // Remove # and split

  logUtmDebug('Processing hash-based routing:', {
    currentHash,
    hashPath,
    hashQuery,
  })

  // Preserve existing hash query parameters and add any remaining non-UTM params
  const existingHashParams = cleanUpUtmParams(new URLSearchParams(hashQuery || ''))
  const remainingParams = new URLSearchParams(newSearch)

  // Merge remaining non-UTM params with existing hash params
  for (const [key, value] of remainingParams.entries()) {
    existingHashParams.set(key, value)
  }

  const finalHashQuery = existingHashParams.toString()
  const finalHash = finalHashQuery ? `#${hashPath}?${finalHashQuery}` : `#${hashPath}`

  logUtmDebug('Navigating to hash-based route:', {
    finalHash,
    finalHashQuery,
  })

  // Use History API to update URL without page refresh, then sync with React Router
  const newUrl = `${window.location.origin}/${finalHash}`
  logUtmDebug('Updating URL to clear UTM params without refresh:', {
    currentUrl: window.location.href,
    newUrl,
    hashPath,
    finalHashQuery,
  })

  // Update the browser URL without refresh using History API
  window.history.replaceState(null, '', newUrl)

  // Then sync React Router state to match the new URL - use the hash path as pathname
  navigate({ pathname: hashPath, search: finalHashQuery, hash: '' }, { replace: true })
}

/**
 * Handle URL navigation and cleanup after UTM processing
 */
function handleUrlNavigation(
  newSearch: string,
  hasQueryParamsOutOfHashbang: boolean,
  navigate: ReturnType<typeof useNavigate>,
  pathname: string,
  hash: string,
): void {
  logUtmDebug('handleUrlNavigation called with:', {
    newSearch,
    hasQueryParamsOutOfHashbang,
    pathname,
    hash,
    currentUrl: window.location.href,
  })

  if (hasQueryParamsOutOfHashbang) {
    handleHashBasedNavigation(newSearch, navigate)
    return
  }

  // For normal hash-based routing, just update the search params
  logUtmDebug('Navigating with normal hash-based routing:', {
    pathname,
    search: newSearch,
    hash,
  })
  navigate({ pathname, search: newSearch, hash }, { replace: true })
}

function hasUtmKeys(search: string): boolean {
  return Array.from(new URLSearchParams(search).keys()).some((key) => key.startsWith('utm_'))
}

/**
 * Debug logging for UTM processing
 */
function logUtmDebug(message: string, data: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[UTM DEBUG] ${message}`, data)
  }
}

/**
 * Process UTM parameters when found
 */
function processUtmParams(
  utm: UtmParams,
  setUtm: (utm: UtmParams) => void,
  navigate: ReturnType<typeof useNavigate>,
  getCurrentLocation: () => Location,
): () => void {
  logUtmDebug('Found UTM params, processing...', utm)
  // Only overrides the UTM if the URL includes at least one UTM param
  setUtm(utm)

  let timeoutId: number | null = null
  let cancelled = false

  const cleanup = (): void => {
    cancelled = true
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const performUtmCleanup = (): void => {
    if (cancelled) return

    const { search, pathname, hash } = getCurrentLocation()
    const latest = extractUtmParams(search)

    if (latest.hasUtmParams) setUtm({ ...utm, ...latest.utm })

    const { hasQueryParamsOutOfHashbang } = latest
    const sourceToClean = hasQueryParamsOutOfHashbang ? window.location.search : search
    const newSearchParams = cleanUpUtmParams(new URLSearchParams(sourceToClean || ''))
    const newSearch = newSearchParams.toString()
    if (newSearch === new URLSearchParams(sourceToClean).toString() && !hasUtmKeys(search)) return

    logUtmDebug('Cleaned search params:', {
      hasQueryParamsOutOfHashbang,
      originalSearch: sourceToClean,
      newSearch,
      windowLocationSearch: window.location.search,
      routerSearch: search,
    })

    handleUrlNavigation(newSearch, hasQueryParamsOutOfHashbang, navigate, pathname, hash)
  }

  if (isInjectedWidget()) {
    // Widget mode does not load GTM; avoid long waitForAnalytics polling.
    timeoutId = window.setTimeout(performUtmCleanup, 0)
    return cleanup
  }

  // Wait for analytics to be ready before cleaning up UTM parameters
  waitForAnalytics()
    .then(() => {
      if (cancelled) return

      logUtmDebug('Analytics ready, cleaning up UTM params after delay', {})
      // Small additional delay to ensure analytics has captured the parameters
      timeoutId = window.setTimeout(performUtmCleanup, 250)
    })
    .catch(() => {
      if (cancelled) return
      // Additional 250ms delay for analytics capture
      timeoutId = window.setTimeout(performUtmCleanup, 250)
    })

  return cleanup
}
