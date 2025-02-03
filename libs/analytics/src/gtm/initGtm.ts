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

// Module-level singleton state
const analytics = {
  instance: null as CowAnalytics | null,
  isInitializing: false,
  gtmId: DEFAULT_GTM_ID,
}

/**
 * Initialize GTM and return a CowAnalytics instance
 * This function ensures GTM is initialized only once
 * @param gtmId - Optional GTM container ID
 * @returns CowAnalytics instance backed by GTM
 * @throws Error if attempting to initialize with different GTM ID
 */
export function initGtm(gtmId: string = DEFAULT_GTM_ID): CowAnalytics {
  // Early return for SSR
  if (typeof window === 'undefined') {
    return new CowAnalyticsGtm()
  }

  // Return existing instance if already initialized
  if (analytics.instance) {
    if (gtmId !== analytics.gtmId) {
      throw new Error('GTM already initialized with different ID')
    }
    return analytics.instance
  }

  // Prevent concurrent initializations
  if (analytics.isInitializing) {
    throw new Error('GTM initialization already in progress')
  }

  analytics.isInitializing = true
  analytics.gtmId = gtmId

  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []

    // Add script to head
    const script = document.createElement('script')
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');`
    document.head.insertBefore(script, document.head.firstChild)

    // Add noscript iframe to body
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`
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
  } finally {
    analytics.isInitializing = false
  }
}

// For testing purposes only
export function __resetGtmInstance() {
  if (process.env.NODE_ENV === 'test') {
    analytics.instance = null
    analytics.isInitializing = false
    analytics.gtmId = DEFAULT_GTM_ID
  }
}
