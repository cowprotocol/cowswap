export { TradeFlowTrackingUpdater } from './TradeFlowTrackingUpdater'
export { BasicTradeFlowTrackingUpdater } from './BasicTradeFlowTrackingUpdater'

// Export types from TradeFlowTrackingUpdater
export type {
  OrderForTracking,
  ActivityItemForTracking,
  OrderStatusConstants,
  TradeFlowTrackingUpdaterProps,
} from './TradeFlowTrackingUpdater'

// Export types from BasicTradeFlowTrackingUpdater
export type { BasicTradeFlowTrackingUpdaterProps } from './BasicTradeFlowTrackingUpdater'

/**
 * Safary Analytics Updaters
 *
 * These components help with tracking different aspects of user flow in the application:
 *
 * - TradeFlowTrackingUpdater: A comprehensive tracker for complete trade flows
 *   that combines page views, wallet connections, and order tracking
 * - BasicTradeFlowTrackingUpdater: A simplified version of TradeFlowTrackingUpdater
 *   that only tracks page views and wallet connections without requiring order props
 *
 * The TradeFlowTrackingUpdater is the recommended component for most trade flows
 * when you have order data available. Use BasicTradeFlowTrackingUpdater when you only
 * need to track page views and wallet connections.
 */
