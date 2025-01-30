/**
 * Shared analytics types
 *
 * This is the single source of truth for all analytics categories across the CoW Protocol applications.
 * When adding new categories, please add them here and use them through imports.
 *
 * Example usage with data attributes:
 * ```tsx
 * import { Category, toGtmEvent } from '@cowprotocol/analytics'
 *
 * function MyComponent() {
 *   return (
 *     <button
 *       data-click-event={toGtmEvent({
 *         category: Category.TRADE,
 *         action: 'Confirm Trade',
 *         label: 'Swap'
 *       })}
 *     >
 *       Confirm
 *     </button>
 *   )
 * }
 * ```
 */

export enum Category {
  // CowSwap Categories
  TRADE = 'Trade',
  LIST = 'Lists',
  HOOKS = 'Hooks',
  CURRENCY_SELECT = 'Currency Select',
  RECIPIENT_ADDRESS = 'Recipient address',
  ORDER_SLIPAGE_TOLERANCE = 'Order Slippage Tolerance',
  ORDER_EXPIRATION_TIME = 'Order Expiration Time',
  WALLET = 'Wallet',
  WRAP_NATIVE_TOKEN = 'Wrapped Native Token',
  CLAIM_COW_FOR_LOCKED_GNO = 'Claim COW for Locked GNO',
  THEME = 'Theme',
  GAMES = 'Games',
  INIT = 'Init',
  TWAP = 'TWAP',
  COW_FORTUNE = 'CoWFortune',
  SURPLUS_MODAL = 'Surplus Modal',
  PROGRESS_BAR = 'Progress Bar',
  NOTIFICATIONS = 'Notifications',

  // Explorer Categories
  ORDER_DETAILS = 'Order details',

  // UI Categories
  SERVICE_WORKER = 'Service Worker',
  FOOTER = 'Footer',
  EXTERNAL_LINK = 'External Link',

  // Widget Categories
  WIDGET_CONFIGURATOR = 'Widget configurator',

  // Cow-Fi Categories
  HOME = 'Homepage',
  NAVIGATION = 'Navigation',
  WIDGET = 'Widget',
  COWAMM = 'CoW AMM',
  COWSWAP = 'CoW Swap',
  COWPROTOCOL = 'CoW Protocol',
  MEVBLOCKER = 'MEV Blocker',
  DAOS = 'DAOs',
  KNOWLEDGEBASE = 'Knowledge Base',
  ERROR404 = 'Error 404',
  CAREERS = 'Careers',
  TOKENS = 'Tokens',
  LEGAL = 'Legal',
}

export type GtmCategory = Category | 'PROGRESS_BAR' // Include GTM_CATEGORIES

/**
 * GTM Event interface for type-safe event tracking
 * Use this interface when creating click events with toGtmEvent
 */
export interface GtmEvent {
  category: Category
  action: string
  label?: string
  value?: number
  // Dynamic properties
  orderId?: string
  orderType?: string
  tokenSymbol?: string
  chainId?: number
}
