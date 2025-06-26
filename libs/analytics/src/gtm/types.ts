/**
 * Types for GTM events and data attributes
 */

import { AnalyticsContext } from '../CowAnalytics'
import { Category, GtmEvent, GA4Event } from '../types'

// Re-export Category as GtmCategory for backward compatibility
export type GtmCategory = Category

export interface GtmClickEvent extends GtmEvent<Category> {
  context?: AnalyticsContext
}

// Type guard to validate GTM event data
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function isValidGtmClickEvent(data: unknown): data is GtmClickEvent {
  if (typeof data !== 'object' || data === null) return false

  const event = data as Record<string, unknown>

  // Required fields
  if (typeof event.category !== 'string' || typeof event.action !== 'string') {
    return false
  }

  // Optional fields
  if (event.label !== undefined && typeof event.label !== 'string') return false
  if (event.value !== undefined && typeof event.value !== 'number') return false
  if (event.orderId !== undefined && typeof event.orderId !== 'string') return false
  if (event.orderType !== undefined && typeof event.orderType !== 'string') return false
  if (event.tokenSymbol !== undefined && typeof event.tokenSymbol !== 'string') return false
  if (event.chainId !== undefined && typeof event.chainId !== 'number') return false

  return true
}

const EXCLUDED_GTM_KEYS = [
  'category',
  'action',
  'label',
  'value',
  'orderId',
  'orderType',
  'tokenSymbol',
  'chainId',
] as const

/**
 * Converts events to GA4-compatible format for Google Tag Manager
 *
 * GA4 uses a flat event model where:
 * - The event name is a clear, descriptive string of the action
 * - Additional context is provided via custom parameters
 *
 * Example:
 * Input event:
 * {
 *   category: 'Wallet',
 *   action: 'Connect wallet button click',
 *   label: 'MetaMask'
 * }
 *
 * Becomes GA4 event:
 * {
 *   event: 'Connect wallet button click',
 *   event_category: 'Wallet',
 *   event_label: 'MetaMask'
 * }
 *
 * @param event The internal event format
 * @returns JSON string of GA4-compatible event
 */
export function toGtmEvent(event: Partial<GtmClickEvent>): string {
  const ga4Event: GA4Event = {
    event: event.action || '',
    ...(event.category && { event_category: event.category }),
    ...(event.label && { event_label: event.label }),
    ...(event.value !== undefined && { event_value: event.value }),
    ...(event.orderId && { order_id: event.orderId }),
    ...(event.orderType && { order_type: event.orderType }),
    ...(event.tokenSymbol && { token_symbol: event.tokenSymbol }),
    ...(event.chainId && { chain_id: event.chainId }),
    ...Object.entries(event)
      .filter(([key]) => !EXCLUDED_GTM_KEYS.includes(key as (typeof EXCLUDED_GTM_KEYS)[number]))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
  }

  return JSON.stringify(ga4Event)
}
