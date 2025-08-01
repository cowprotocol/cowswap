import { AnalyticsCategory, GtmEvent, toGtmEvent } from '@cowprotocol/analytics'

/**
 * CowSwap-specific analytics categories
 * Extends the base Category enum with CowSwap-specific values
 */
export enum CowSwapAnalyticsCategory {
  // Trade Categories
  TRADE = 'Trade',
  Bridge = 'Bridge',
  LIST = 'Lists',
  HOOKS = 'Hooks',
  RECIPIENT_ADDRESS = 'Recipient address',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO',
  TWAP = 'TWAP',
  SURPLUS_MODAL = 'Surplus Modal',
  COWSWAP = 'CoWSwap',
  LIMIT_ORDER_SETTINGS = 'Limit Order Settings',

  // UI Categories
  WALLET = 'Wallet',
  NOTIFICATIONS = 'Notifications',
  PROGRESS_BAR = 'Progress Bar',
  GAMES = 'Games',
  COW_FORTUNE = 'CoWFortune',
}

/**
 * CowSwap-specific GTM event type
 */
export type CowSwapGtmEvent = GtmEvent<CowSwapAnalyticsCategory>

/**
 * Helper function to create GTM events with CowSwap categories
 */
export function toCowSwapGtmEvent(
  event: Omit<CowSwapGtmEvent, 'category'> & { category: CowSwapAnalyticsCategory },
): string {
  // Since CowSwapAnalyticsCategory values are string literals that match the expected format,
  // we can safely cast through unknown to GtmEvent
  return toGtmEvent({
    ...event,
    category: event.category as unknown as AnalyticsCategory,
  } as GtmEvent)
}
