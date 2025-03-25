import { CowAnalytics } from './CowAnalytics'

/**
 * Helper function to get the analytics instance from window
 * This is used across the application to access the singleton analytics instance
 */
export const getCowAnalytics = (): CowAnalytics | undefined => {
  if (typeof window !== 'undefined' && 'cowAnalyticsInstance' in window) {
    return window.cowAnalyticsInstance as CowAnalytics
  }
  return undefined
}
