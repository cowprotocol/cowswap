/**
 * Types for GTM events and data attributes
 */

import { AnalyticsContext } from '../CowAnalytics'
import { Category, GtmEvent } from '../types'

// Re-export Category as GtmCategory for backward compatibility
export type GtmCategory = Category

export interface GtmClickEvent extends GtmEvent<Category> {
  context?: AnalyticsContext
}

// Type guard to validate GTM event data
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

// Helper to create data-click-event attribute value with dynamic properties
export function toGtmEvent(event: Partial<GtmClickEvent>): string {
  return JSON.stringify(event)
}
