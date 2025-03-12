/**
 * Safary Analytics Service
 *
 * This module provides a type-safe way to interact with the Safary analytics service.
 * It handles tracking various trade-related events for marketing attribution.
 */

/**
 * Safary trade types
 */
export enum SafaryTradeType {
  SWAP_ORDER = 'swap', // Regular swap
  LIMIT_ORDER = 'limit_order', // Limit order
  TWAP_ORDER = 'twap_order', // TWAP order
}

/**
 * Safary event actions for trade flow
 */
export enum SafaryEventAction {
  PAGE_VIEW = 'page_view',
  WALLET_CONNECTED = 'wallet_connected',
  TOKEN_SELECTED = 'token_selected',
  ORDER_SUBMITTED = 'order_submitted',
  ORDER_EXECUTED = 'order_executed',
  ORDER_FAILED = 'order_failed',
}

/**
 * Parameters for Safary trade event
 */
export interface SafaryTradeParams {
  walletAddress: string
  fromAmount: number
  fromCurrency: string
  fromAmountUSD?: number
  contractAddress: string
  toAmount?: number
  toCurrency?: string
  toAmountUSD?: number
  transactionHash?: string
  tradeType?: string
}

/**
 * Type guard to check if window.safary is available
 */
export function hasSafary(): boolean {
  return typeof window !== 'undefined' && !!window.safary?.track
}

/**
 * Track a generic event using Safary
 *
 * @param eventType - Type of event to track
 * @param eventName - Name of the event
 * @param parameters - Optional parameters for the event
 */
export function trackSafaryEvent(
  eventType: string,
  eventName: string,
  parameters?: Record<string, string | number | boolean>,
): void {
  if (!hasSafary()) return

  try {
    window.safary!.track({
      eventType,
      eventName,
      ...(parameters ? { parameters } : {}),
    })
  } catch (error) {
    console.error('Error tracking Safary event:', error)
  }
}

/**
 * Track a trade-related event using Safary
 *
 * @param tradeType - Type of trade (swap, limit_order, twap_order)
 * @param eventName - Name of the event
 * @param params - Trade parameters
 */
export function trackSafaryTradeEvent(tradeType: string, eventName: string, params: Partial<SafaryTradeParams>): void {
  if (!hasSafary()) return

  try {
    window.safary!.track({
      eventType: tradeType,
      eventName,
      parameters: params,
    })
  } catch (error) {
    console.error(`Error tracking Safary ${tradeType} event:`, error)
  }
}

// Extend the global Window interface to include safary
declare global {
  interface Window {
    safary?: {
      track: (args: {
        eventType: string
        eventName: string
        parameters?: Record<string, string | number | boolean>
      }) => void
    }
  }
}
