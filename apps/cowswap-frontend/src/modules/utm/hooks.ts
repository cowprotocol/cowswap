import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { waitForAnalytics } from '@cowprotocol/analytics'
import { getUtmParams, cleanUpUtmParams, UtmParams } from '@cowprotocol/common-utils'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { utmAtom } from './state'

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
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
  const existingHashParams = new URLSearchParams(hashQuery || '')
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

/**
 * Process UTM parameters when found
 */
function processUtmParams(
  utm: UtmParams,
  setUtm: (utm: UtmParams) => void,
  search: string,
  hasQueryParamsOutOfHashbang: boolean,
  navigate: ReturnType<typeof useNavigate>,
  pathname: string,
  hash: string,
): () => void {
  logUtmDebug('Found UTM params, processing...', utm)
  // Only overrides the UTM if the URL includes at least one UTM param
  setUtm(utm)

  let timeoutId: number | null = null

  // Return cleanup function for potential cancellation
  const cleanup = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const performUtmCleanup = (): void => {
    // Clean up UTM params from window.location.search if they exist there
    // Otherwise clean from router search params
    const windowHasUtm = Object.values(getUtmParams(new URLSearchParams(window.location.search || ''))).some(Boolean)
    const sourceToClean = windowHasUtm ? window.location.search : search
    const newSearchParams = cleanUpUtmParams(new URLSearchParams(sourceToClean || ''))
    const newSearch = newSearchParams.toString()

    logUtmDebug('Cleaned search params:', {
      hasQueryParamsOutOfHashbang,
      originalSearch: sourceToClean,
      newSearch,
      windowLocationSearch: window.location.search,
      routerSearch: search,
    })

    handleUrlNavigation(newSearch, hasQueryParamsOutOfHashbang, navigate, pathname, hash)
  }

  // Wait for analytics to be ready before cleaning up UTM parameters
  waitForAnalytics()
    .then(() => {
      logUtmDebug('Analytics ready, cleaning up UTM params after delay', {})
      // Small additional delay to ensure analytics has captured the parameters
      timeoutId = window.setTimeout(performUtmCleanup, 250)
    })
    .catch((error) => {
      logUtmDebug('Analytics detection failed, proceeding with cleanup', { error })
      // Additional 250ms delay for analytics capture
      timeoutId = window.setTimeout(performUtmCleanup, 250)
    })

  return cleanup
}

export function useInitializeUtm(): void {
  const navigate = useNavigate()
  const { search, pathname, hash } = useLocation()
  const hasProcessedUtm = useRef(false)
  const setUtm = useSetAtom(utmAtom)

  useLayoutEffect(() => {
    logUtmDebug('useInitializeUtm effect running:', {
      hasProcessedUtm: hasProcessedUtm.current,
      search,
      pathname,
      hash,
      windowLocationSearch: window.location.search,
      windowLocationHref: window.location.href,
    })

    // Prevent multiple runs of UTM processing
    if (hasProcessedUtm.current) {
      logUtmDebug('Already processed UTM, skipping', {})
      return undefined
    }

    const { utm, hasUtmParams, hasQueryParamsOutOfHashbang, searchParams } = extractUtmParams(search)

    if (hasUtmParams) {
      // Mark as processed to prevent re-runs
      hasProcessedUtm.current = true
      return processUtmParams(utm, setUtm, search, hasQueryParamsOutOfHashbang, navigate, pathname, hash)
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
      // Mark as processed to prevent re-runs
      hasProcessedUtm.current = true
      handleUrlNavigation(newSearch, hasQueryParamsOutOfHashbang, navigate, pathname, hash)
    }

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - we only want this to run once on mount
}
