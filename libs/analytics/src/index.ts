// Core analytics initialization
export { initGtm } from './gtm/initGtm'
export { initPixelAnalytics } from './pixels/initPixelAnalytics'
export { WebVitalsAnalytics } from './webVitals/WebVitalsAnalytics'

// GTM tracking
export type { GtmClickEvent, GtmCategory } from './gtm/types'
export { toGtmEvent } from './gtm/types'

// Analytics context and hooks
export { CowAnalyticsProvider, useCowAnalytics } from './context/CowAnalyticsContext'
export { useAnalyticsReporter } from './hooks/useAnalyticsReporter'

// Core types and categories
export { Category } from './types'
export type { AnalyticsCategory, BaseGtmEvent, GtmEvent } from './types'
export type { AnalyticsContext, CowAnalytics } from './CowAnalytics'

// Utils
export { getCowAnalytics } from './utils'

export * from './CowAnalytics'
export * from './widget/orderLifecycleAnalytics'
