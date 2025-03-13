/**
 * This module provides standardized GTM-based tracking events for all trading flows.
 * These events can be configured in the GTM dashboard to pass data to various analytics services.
 */

import { Currency } from '@uniswap/sdk-core'

/**
 * Event names that match expected event types
 */
export enum TradeTrackingEventType {
  PAGE_VIEW = 'page_view',
  WALLET_CONNECTED = 'wallet_connected',
  TOKEN_SELECTED = 'token_selected',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_EXECUTED = 'order_executed',
  ORDER_FAILED = 'order_failed',
}

/**
 * Types of trades for event categorization
 */
export enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit_order',
  TWAP = 'twap_order',
}

/**
 * Helper function to convert ActivityStatus enum values to descriptive strings
 * This is useful for analytics where string values are more readable than numeric enum values
 *
 * ActivityStatus is a numeric enum defined in apps/cowswap-frontend/src/legacy/hooks/useRecentActivity.ts:
 *
 * enum ActivityStatus {
 *   PENDING = 0,
 *   PRESIGNATURE_PENDING = 1,
 *   CONFIRMED = 2,
 *   EXPIRED = 3,
 *   CANCELLING = 4,
 *   CANCELLED = 5,
 *   CREATING = 6,
 *   FAILED = 7,
 * }
 * TODO: Consider using the ActivityStatus enum directly for tighter coupling and better type safety.
 * This would require updating the legacy hook and moving the enum to the libs/types
 */
export function getActivityStatusString(status: number): string {
  // Map of ActivityStatus enum values to human-readable strings for analytics
  const activityStatusMap: Record<number, string> = {
    0: 'pending', // ActivityStatus.PENDING
    1: 'presignaturePending', // ActivityStatus.PRESIGNATURE_PENDING
    2: 'fulfilled', // ActivityStatus.CONFIRMED maps to 'fulfilled' in analytics
    3: 'expired', // ActivityStatus.EXPIRED
    4: 'cancelling', // ActivityStatus.CANCELLING
    5: 'cancelled', // ActivityStatus.CANCELLED
    6: 'creating', // ActivityStatus.CREATING
    7: 'failed', // ActivityStatus.FAILED
  }

  return activityStatusMap[status] || `unknown_status_${status}`
}

/**
 * Push an event to GTM's dataLayer with standardized parameters
 * This ensures consistency across all tracking services
 */
function pushTradeEvent(eventType: TradeTrackingEventType, params: Record<string, any>) {
  if (typeof window === 'undefined' || !window.dataLayer) return

  window.dataLayer.push({
    event: eventType,
    event_category: 'trade',
    ...params,
  })
}

/**
 * Track page view with UTM parameters
 */
export function trackPageView(pageView: string) {
  pushTradeEvent(TradeTrackingEventType.PAGE_VIEW, {
    page_view: pageView,
  })
}

/**
 * Track wallet connection
 */
export function trackWalletConnected(account: string, walletName?: string) {
  pushTradeEvent(TradeTrackingEventType.WALLET_CONNECTED, {
    walletAddress: account,
    walletType: walletName || 'unknown',
  })
}

/**
 * Track token selection
 */
export function trackTokenSelected(account: string, field: string, currency: Currency | null | undefined) {
  if (!currency) return

  pushTradeEvent(TradeTrackingEventType.TOKEN_SELECTED, {
    walletAddress: account,
    tokenAddress: currency.isToken ? currency.address : 'NATIVE',
    tokenSymbol: currency.symbol || 'unknown',
    field,
  })
}

/**
 * Track order submission
 */
export function trackOrderSubmitted(params: {
  walletAddress: string
  tradeType: TradeType
  fromAmount?: number
  fromCurrency?: string
  fromAmountUSD?: number
  toAmount?: number
  toCurrency?: string
  toAmountUSD?: number
  contractAddress?: string
  orderId?: string
  orderStatus?: string
}) {
  pushTradeEvent(TradeTrackingEventType.ORDER_SUBMITTED, params)
}

/**
 * Track order execution (successful trade)
 */
export function trackOrderExecuted(params: {
  walletAddress: string
  tradeType: TradeType
  fromAmount?: number
  fromCurrency?: string
  fromAmountUSD?: number
  toAmount?: number
  toCurrency?: string
  toAmountUSD?: number
  contractAddress?: string
  transactionHash?: string
  orderId?: string
  orderStatus?: string
}) {
  pushTradeEvent(TradeTrackingEventType.ORDER_EXECUTED, params)
}

/**
 * Track order failure
 */
export function trackOrderFailed(
  params: {
    walletAddress: string
    tradeType: TradeType
    fromCurrency?: string
    toCurrency?: string
    contractAddress?: string
    orderId?: string
    orderStatus?: string
    errorCode?: string
    errorType?: string
  },
  error?: string,
) {
  pushTradeEvent(TradeTrackingEventType.ORDER_FAILED, {
    ...params,
    error_message: error,
  })
}

// Type definition for GTM dataLayer
declare global {
  interface Window {
    dataLayer: unknown[]
  }
}
