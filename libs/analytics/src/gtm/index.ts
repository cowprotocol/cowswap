// GTM initialization
export { initGtm } from './initGtm'

// GTM base analytics class
export { CowAnalyticsGtm } from './CowAnalyticsGtm'

// Types
export type { GtmClickEvent, GtmCategory } from './types'
export { toGtmEvent } from './types'

// Trade tracking
export {
  TradeType,
  TradeTrackingEventType,
  trackPageView,
  trackWalletConnected,
  trackTokenSelected,
  trackOrderSubmitted,
  trackOrderExecuted,
  trackOrderFailed,
} from './TradeTrackingEvents'

// Trade tracking hook for React components
export { useTradeTracking } from '../hooks/useTradeTracking'
