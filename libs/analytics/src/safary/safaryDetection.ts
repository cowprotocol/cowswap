/**
 * Safary SDK Detection Utilities
 * Provides reliable detection of Safary analytics initialization
 */

// Extend Window interface for Safary globals
declare global {
  interface Window {
    safary?: unknown
  }
}

/**
 * Check if Safary SDK is ready to receive events
 * Uses multiple detection methods for maximum reliability
 */
export function isSafaryReady(): boolean {
  if (typeof window === 'undefined') return false

  // Check for Safary SDK script injection (most reliable)
  const safaryScript =
    document.querySelector('script[data-name="safary-sdk"]') || document.querySelector('script[src*="safary"]')

  // Check for Safary global object
  const safaryGlobal = !!window.safary

  return !!(safaryScript || safaryGlobal)
}
