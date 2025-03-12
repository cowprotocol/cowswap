// Core analytics initialization
export { initGtm } from './gtm/initGtm'
export { initPixelAnalytics } from './pixels/initPixelAnalytics'
export { WebVitalsAnalytics } from './webVitals/WebVitalsAnalytics'

// GTM tracking
export type { GtmClickEvent, GtmCategory } from './gtm/types'
export { toGtmEvent } from './gtm/types'

// Trade tracking through GTM
export {
  TradeType,
  TradeTrackingEventType,
  trackPageView,
  trackWalletConnected,
  trackTokenSelected,
  trackOrderSubmitted,
  trackOrderExecuted,
  trackOrderFailed,
} from './gtm/TradeTrackingEvents'
export { useTradeTracking } from './hooks/useTradeTracking'

// Analytics context and hooks
export { CowAnalyticsProvider, useCowAnalytics } from './context/CowAnalyticsContext'
export { useAnalyticsReporter } from './hooks/useAnalyticsReporter'

// Core types and categories
export { Category } from './types'
export type { AnalyticsCategory, BaseGtmEvent, GtmEvent } from './types'
export type { AnalyticsContext, CowAnalytics } from './CowAnalytics'

// Safary analytics is deprecated in favor of GTM-based tracking
// See libs/analytics/src/safary/DEPRECATED.md for details
