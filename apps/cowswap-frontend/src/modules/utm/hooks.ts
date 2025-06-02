import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { utmAtom } from './state'
import { UtmParams } from './types'

// Extend Window interface for analytics globals
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    google_tag_manager?: Record<string, unknown>
    safary?: unknown
  }
}

/**
 * Extract all UTM parameters from URL search params
 * Captures any parameter starting with 'utm_'
 */
function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utmParams: UtmParams = {}

  // Iterate through all URL parameters and capture utm_* ones
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('utm_') && value) {
      // Convert utm_source to utmSource, utm_medium to utmMedium, etc.
      const camelCaseKey = key.replace(/^utm_/, '').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      const propertyKey = `utm${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`
      utmParams[propertyKey] = value
    }
  }

  return utmParams
}

function cleanUpParams(searchParams: URLSearchParams): URLSearchParams {
  // Remove all utm_* parameters
  const paramsToDelete: string[] = []
  for (const [key] of searchParams.entries()) {
    if (key.startsWith('utm_')) {
      paramsToDelete.push(key)
    }
  }

  paramsToDelete.forEach((param) => searchParams.delete(param))
  return searchParams
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

/**
 * Check if GTM is ready to receive events
 */
function isGtmReady(): boolean {
  if (typeof window === 'undefined') return false

  // Check multiple GTM indicators
  return !!(
    window.dataLayer ||
    window.gtag ||
    (window.google_tag_manager && Object.keys(window.google_tag_manager).length > 0)
  )
}

/**
 * Check if Safary SDK is ready to receive events
 */
function isSafaryReady(): boolean {
  if (typeof window === 'undefined') return false

  // Check for Safary SDK script injection (most reliable)
  const safaryScript =
    document.querySelector('script[data-name="safary-sdk"]') || document.querySelector('script[src*="safary"]')

  // Check for Safary global object
  const safaryGlobal = !!window.safary

  return !!(safaryScript || safaryGlobal)
}

/**
 * Check if analytics tools are ready to receive events
 */
function isAnalyticsReady(): { gtm: boolean; safary: boolean; both: boolean } {
  const gtm = isGtmReady()
  const safary = isSafaryReady()

  return {
    gtm,
    safary,
    both: gtm && safary,
  }
}

/**
 * Wait for analytics tools to be ready with sophisticated timing logic
 * Matches the logic from the utm-fix.js attribution loading system
 */
function waitForAnalytics(): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    const checkInterval = 100 // Check every 100ms

    const analyticsInterval = setInterval(() => {
      attempts++
      const analytics = isAnalyticsReady()
      const elapsed = Date.now() - startTime

      // Log detailed status for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[UTM Analytics] Readiness check:', {
          attempt: attempts,
          elapsed: elapsed + 'ms',
          gtmReady: analytics.gtm,
          safaryReady: analytics.safary,
          bothReady: analytics.both,
          dataLayer: !!window.dataLayer,
          gtag: !!window.gtag,
          googleTagManager: !!(window.google_tag_manager && Object.keys(window.google_tag_manager).length > 0),
          safaryGlobal: !!window.safary,
          safaryScript: !!(
            document.querySelector('script[data-name="safary-sdk"]') || document.querySelector('script[src*="safary"]')
          ),
        })
      }

      // If both GTM and Safary are ready, give them extra time and proceed
      if (analytics.both) {
        clearInterval(analyticsInterval)
        if (process.env.NODE_ENV === 'development') {
          console.log('[UTM Analytics] Both GTM and Safary detected, giving extra time for attribution...')
        }
        // Give analytics scripts extra time to actually track (matches utm-fix.js timing)
        setTimeout(resolve, 1000)
      }
      // If only GTM is ready and we've waited 3 seconds for Safary, proceed
      else if (analytics.gtm && elapsed >= 3000) {
        clearInterval(analyticsInterval)
        if (process.env.NODE_ENV === 'development') {
          console.log('[UTM Analytics] GTM ready, proceeding (Safary may still be loading)')
        }
        // Shorter delay when only GTM is available
        setTimeout(resolve, 500)
      }
      // Hard timeout - ensure we never block the user indefinitely
      else if (attempts >= maxAttempts) {
        clearInterval(analyticsInterval)
        if (process.env.NODE_ENV === 'development') {
          console.log('[UTM Analytics] Timeout reached, proceeding anyway')
        }
        resolve()
      }
    }, checkInterval)

    // Additional hard timeout safety net (10 seconds)
    setTimeout(() => {
      clearInterval(analyticsInterval)
      if (process.env.NODE_ENV === 'development') {
        console.log('[UTM Analytics] Hard timeout reached, force proceeding')
      }
      resolve()
    }, 10000)
  })
}

export function useInitializeUtm(): void {
  const navigate = useNavigate()
  const { search, pathname, hash } = useLocation()

  // get atom setter
  const setUtm = useSetAtom(utmAtom)

  useLayoutEffect(
    () => {
      const hasQueryParamsOutOfHashbang = !search && window.location.search
      const searchParams = new URLSearchParams(search || window.location.search)
      const utm = getUtmParams(searchParams)

      const { href, origin, pathname: locationPath, hash: locationHash, search: locationSearch } = window.location

      if (Object.values(utm).filter(Boolean).length > 0) {
        // Only overrides the UTM if the URL includes at least one UTM param
        setUtm(utm)

        // Wait for analytics to be ready before cleaning up UTM parameters
        waitForAnalytics().then(() => {
          // Small additional delay to ensure analytics has captured the parameters
          setTimeout(() => {
            const newSearch = cleanUpParams(new URLSearchParams(search || window.location.search)).toString()

            if (hasQueryParamsOutOfHashbang) {
              window.location.replace(newSearch ? `/#${locationPath}?${newSearch}` : '/')
              return
            }

            const validHref = `${origin}${locationPath}${locationHash}${locationSearch}`
            const isWeirdURl = href !== validHref

            // Example: http://localhost:3000?
            if (isWeirdURl) {
              window.location.href = validHref
              return
            }

            navigate({ pathname, search: newSearch, hash }, { replace: true })
          }, 250) // Additional 250ms delay for analytics capture
        })
      } else {
        // No UTM parameters, proceed with normal cleanup immediately
        const newSearch = cleanUpParams(searchParams).toString()

        if (hasQueryParamsOutOfHashbang) {
          window.location.replace(newSearch ? `/#${locationPath}?${newSearch}` : '/')
          return
        }

        const validHref = `${origin}${locationPath}${locationHash}${locationSearch}`
        const isWeirdURl = href !== validHref

        // Example: http://localhost:3000?
        if (isWeirdURl) {
          window.location.href = validHref
          return
        }

        navigate({ pathname, search: newSearch, hash }, { replace: true })
      }
    },
    // No dependencies: It only needs to be initialized once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
}
