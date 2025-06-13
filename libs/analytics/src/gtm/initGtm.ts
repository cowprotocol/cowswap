/**
 * GTM initialization module
 * Provides type-safe initialization of Google Tag Manager
 * Ensures single initialization of GTM instance
 */

import { CowAnalyticsGtm } from './CowAnalyticsGtm'

import { CowAnalytics } from '../CowAnalytics'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

const DEFAULT_GTM_ID = 'GTM-TBX4BV5M'

// Module-level singleton state - maintains instance cache across both server and browser environments
// Note: In server environments, each module load maintains its own cache, ensuring consistent
// behavior within each request context while preventing cross-request interference
const analytics = {
  instance: null as CowAnalytics | null,
  gtmId: DEFAULT_GTM_ID,
}

/**
 * Initialize GTM and return a CowAnalytics instance
 * This function ensures GTM is initialized only once and properly cached in both server and browser environments
 * @param gtmId - Optional GTM container ID
 * @returns CowAnalytics instance backed by GTM
 * @throws Error if attempting to initialize with different GTM ID or if GTM ID format is invalid
 */
export function initGtm(gtmId: string = DEFAULT_GTM_ID): CowAnalytics {
  // Validate GTM ID format (GTM-XXXXXXXX or longer)
  if (!/^GTM-[A-Z0-9]{7,}$/.test(gtmId)) {
    const error = new Error(
      'Invalid GTM ID format. Expected format: GTM-XXXXXXX... (GTM- followed by 7 or more alphanumeric characters)',
    )
    console.error('[Analytics] GTM initialization failed:', error)
    throw error
  }

  // Check for cached instance first - this applies to both server and browser environments
  // This ensures we maintain a singleton instance regardless of environment
  if (analytics.instance) {
    // Prevent initialization with different GTM IDs
    if (gtmId !== analytics.gtmId) {
      throw new Error('GTM already initialized with different ID')
    }
    return analytics.instance
  }

  // Store GTM ID before any environment-specific logic
  analytics.gtmId = gtmId

  // Handle server-side initialization
  // This check will be true when running on the server (Node.js environment)
  if (typeof window === 'undefined') {
    // Create and cache instance for server-side
    // This ensures we don't create new instances on subsequent server-side calls
    analytics.instance = new CowAnalyticsGtm()
    return analytics.instance
  }

  // Browser-specific initialization
  try {
    // Initialize dataLayer for browser environment
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

    // Add script to head with performance optimizations
    const script = document.createElement('script')
    script.async = true
    script.setAttribute('importance', 'low')
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    document.head.insertBefore(script, document.head.firstChild)

    // Add noscript iframe to body
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.insertBefore(noscript, document.body.firstChild)

    // Create and store singleton instance
    analytics.instance = new CowAnalyticsGtm()
    return analytics.instance
  } catch (error) {
    console.error('Failed to initialize GTM:', error)
    throw error
  }
}

// For testing purposes only
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function __resetGtmInstance() {
  if (process.env.NODE_ENV === 'test') {
    analytics.instance = null
    analytics.gtmId = DEFAULT_GTM_ID
  }
}
