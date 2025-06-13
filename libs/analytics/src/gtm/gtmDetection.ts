/**
 * GTM (Google Tag Manager) Detection Utilities
 * Provides reliable detection of GTM initialization with multiple fallbacks
 */

// Extend Window interface for GTM globals
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    google_tag_manager?: Record<string, unknown>
  }
}

/**
 * Check if GTM is ready to receive events
 * Uses multiple GTM indicators for maximum reliability
 */
export function isGtmReady(): boolean {
  if (typeof window === 'undefined') return false

  // Check multiple GTM indicators
  return !!(
    window.dataLayer || // Primary GTM indicator
    window.gtag || // GTM's gtag function
    (window.google_tag_manager && // GTM container object
      Object.keys(window.google_tag_manager).length > 0)
  )
}
