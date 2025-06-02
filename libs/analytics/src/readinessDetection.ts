/**
 * Analytics Readiness Detection
 * Sophisticated timing logic for waiting on GTM and Safary initialization
 * Matches the utm-fix.js attribution loading system
 */

import { isGtmReady } from './gtm/gtmDetection'
import { isSafaryReady } from './safary/safaryDetection'

export interface AnalyticsReadiness {
  gtm: boolean
  safary: boolean
  both: boolean
}

/**
 * Check if analytics tools are ready to receive events
 */
export function isAnalyticsReady(): AnalyticsReadiness {
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
 *
 * @returns Promise that resolves when analytics are ready or timeout is reached
 */
export function waitForAnalytics(): Promise<void> {
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
