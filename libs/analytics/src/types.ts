/**
 * Base analytics types
 *
 * Core analytics type definitions that can be extended by specific applications.
 * Each application should define its own categories that implement these base types.
 */

// Legacy category type for backward compatibility
export enum Category {
  // UI Categories
  SERVICE_WORKER = 'Service Worker',
  FOOTER = 'Footer',
  EXTERNAL_LINK = 'External Link',
}

// Re-export the legacy category as GtmCategory for backward compatibility
export type GtmCategory = Category

/**
 * GA4-compatible event format
 * See: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */
export interface GA4Event {
  event: string // The event name
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // Additional parameters
}

/**
 * Base GTM event format - maintained for backward compatibility
 * Will be transformed into GA4 format before sending to dataLayer
 */
export interface BaseGtmEvent<T extends string = Category> {
  category: T
  action: string
  label?: string
  value?: number
  orderId?: string
  orderType?: string
  tokenSymbol?: string
  chainId?: number
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // Allow additional custom parameters
}

// Base type for creating application-specific category enums
export type AnalyticsCategory = string

/**
 * Helper type for creating application-specific GTM events
 *
 * Usage example in an app:
 * ```typescript
 * // In your app's analytics types file:
 * export enum AppCategory {
 *   TRADE = 'Trade',
 *   WALLET = 'Wallet',
 *   // ... other app-specific categories
 * }
 *
 * export type AppGtmEvent = GtmEvent<AppCategory>
 * ```
 */
export type GtmEvent<T extends AnalyticsCategory = Category> = BaseGtmEvent<T>

// Re-export for backward compatibility
export { toGtmEvent } from './gtm/types'
