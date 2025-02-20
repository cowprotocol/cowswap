import { Category, GtmEvent } from '@cowprotocol/analytics'

/**
 * Explorer-specific analytics categories
 */
export enum ExplorerCategory {
  // Core Categories
  ORDER_DETAILS = 'Order details',
}

// Re-export common UI categories
export { Category }

/**
 * Explorer-specific GTM event type
 */
export type ExplorerGtmEvent = GtmEvent<ExplorerCategory | Category>
