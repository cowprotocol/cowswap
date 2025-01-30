/**
 * GTM initialization module
 * Provides type-safe initialization of Google Tag Manager
 */

import { CowAnalyticsGtm } from './CowAnalyticsGtm'

import { CowAnalytics } from '../CowAnalytics'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

const DEFAULT_GTM_ID = 'GTM-TBX4BV5M'

/**
 * Initialize GTM and return a CowAnalytics instance
 * @param gtmId - Optional GTM container ID
 * @returns CowAnalytics instance backed by GTM
 */
export function initGtm(gtmId: string = DEFAULT_GTM_ID): CowAnalytics {
  if (typeof window === 'undefined') {
    return new CowAnalyticsGtm()
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []

  try {
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
  } catch (error) {
    console.error('Failed to initialize GTM:', error)
  }

  // Return GTM analytics instance
  return new CowAnalyticsGtm()
}
