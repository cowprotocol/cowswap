/**
 * Analytics Readiness Detection
 * Sophisticated timing logic for waiting on GTM and Safary initialization
 * Matches the utm-fix.js attribution loading system
 */

import { waitForCookieConsentDecision } from './consent/cookieConsent.store'
import { isGtmReady } from './gtm/gtmDetection'
import { isSafaryReady } from './safary/safaryDetection'

export interface AnalyticsReadiness {
  gtm: boolean
  safary: boolean
}

/**
 * Check if analytics tools are ready to receive events
 */
export function isAnalyticsReady(): AnalyticsReadiness {
  return {
    gtm: isGtmReady(),
    safary: isSafaryReady(),
  }
}

/**
 * Waits for the visitor's cookie choice, then for GTM and Safary if they accepted.
 * Resolves right away after a rejection, and stays pending while no choice is made.
 */
export async function waitForAnalytics(): Promise<void> {
  const choice = await waitForCookieConsentDecision()

  if (choice !== 'accepted') return

  return new Promise((resolve) => {
    const startTime = Date.now()
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait
    const checkInterval = 100 // Check every 100ms

    const analyticsInterval = setInterval(() => {
      attempts++
      const analytics = isAnalyticsReady()
      const elapsed = Date.now() - startTime
      const bothReady = analytics.gtm && analytics.safary

      logAnalyticsStatus(attempts, elapsed, analytics, bothReady)

      if (bothReady) {
        handleBothReady(analyticsInterval, resolve)
      } else if (analytics.gtm && elapsed >= 3000) {
        handleGtmOnlyReady(analyticsInterval, resolve)
      } else if (attempts >= maxAttempts) {
        handleTimeout(analyticsInterval, resolve, 'Timeout reached, proceeding anyway')
      }
    }, checkInterval)

    // Additional hard timeout safety net (10 seconds)
    setTimeout(() => {
      handleTimeout(analyticsInterval, resolve, 'Hard timeout reached, force proceeding')
    }, 10000)
  })
}

/**
 * Handle the case when both GTM and Safary are ready
 */
function handleBothReady(analyticsInterval: NodeJS.Timeout, resolve: () => void): void {
  clearInterval(analyticsInterval)
  if (process.env.NODE_ENV === 'development') {
    console.log('[UTM Analytics] Both GTM and Safary detected, giving extra time for attribution...')
  }
  // Give analytics scripts extra time to actually track (matches utm-fix.js timing)
  setTimeout(resolve, 1000)
}

/**
 * Handle the case when only GTM is ready after timeout
 */
function handleGtmOnlyReady(analyticsInterval: NodeJS.Timeout, resolve: () => void): void {
  clearInterval(analyticsInterval)
  if (process.env.NODE_ENV === 'development') {
    console.log('[UTM Analytics] GTM ready, proceeding (Safary may still be loading)')
  }
  // Shorter delay when only GTM is available
  setTimeout(resolve, 500)
}

/**
 * Handle timeout scenarios
 */
function handleTimeout(analyticsInterval: NodeJS.Timeout, resolve: () => void, message: string): void {
  clearInterval(analyticsInterval)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[UTM Analytics] ${message}`)
  }
  resolve()
}

/**
 * Log detailed analytics status for debugging
 */
function logAnalyticsStatus(
  attempts: number,
  elapsed: number,
  analytics: AnalyticsReadiness,
  bothReady: boolean,
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[UTM Analytics] Readiness check:', {
      attempt: attempts,
      elapsed: elapsed + 'ms',
      gtmReady: analytics.gtm,
      safaryReady: analytics.safary,
      bothReady,
      dataLayer: !!window.dataLayer,
      gtag: !!window.gtag,
      googleTagManager: !!(window.google_tag_manager && Object.keys(window.google_tag_manager).length > 0),
      safaryGlobal: !!window.safary,
      safaryScript: !!(
        document.querySelector('script[data-name="safary-sdk"]') || document.querySelector('script[src*="safary"]')
      ),
    })
  }
}
