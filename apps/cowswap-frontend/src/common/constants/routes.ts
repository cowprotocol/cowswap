import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { BadgeTypes } from '@cowprotocol/ui'

export const TRADE_WIDGET_PREFIX = isInjectedWidget() ? '/widget' : ''

export const Routes = {
  HOME: '/',
  SWAP: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/:inputCurrencyId?/:outputCurrencyId?`,
  HOOKS: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/hooks/:inputCurrencyId?/:outputCurrencyId?`,
  COW_SHED: `/:chainId?${TRADE_WIDGET_PREFIX}/cowShed`,
  LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit/:inputCurrencyId?/:outputCurrencyId?`,
  YIELD: `/:chainId?${TRADE_WIDGET_PREFIX}/yield/:inputCurrencyId?/:outputCurrencyId?`,
  ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit-orders/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced-orders/:inputCurrencyId?/:outputCurrencyId?`,
  SEND: '/send',
  ACCOUNT: '/account',
  ACCOUNT_TOKENS: '/account/tokens',
  ACCOUNT_TOKENS_SINGLE: '/account/tokens/:address',
  ACCOUNT_GOVERNANCE: '/account/governance',
  ABOUT: '/about',
  PRIVACY_POLICY: '/privacy-policy',
  COOKIE_POLICY: '/cookie-policy',
  TERMS_CONDITIONS: '/terms-and-conditions',
  FAQ: '/faq',
  FAQ_PROTOCOL: '/faq/protocol',
  FAQ_TOKEN: '/faq/token',
  FAQ_TRADING: '/faq/trading',
  FAQ_LIMIT_ORDERS: '/faq/limit-order',
  FAQ_ETH_FLOW: '/faq/sell-native',
  PLAY_COWRUNNER: '/play/cow-runner',
  PLAY_MEVSLICER: '/play/mev-slicer',
  ANYSWAP_AFFECTED: '/anyswap-affected-users',
  CHAT: '/chat',
  DOCS: '/docs',
  STATS: '/stats',
  TWITTER: '/twitter',
} as const

export type RoutesKeys = keyof typeof Routes
export type RoutesValues = (typeof Routes)[RoutesKeys]

export interface IMenuItem {
  route: RoutesValues
  label: string
  fullLabel?: string
  description: string
  badge?: string
  badgeImage?: string
  badgeType?: (typeof BadgeTypes)[keyof typeof BadgeTypes]
}

export const MENU_ITEMS: IMenuItem[] = [
  { route: Routes.SWAP, label: 'Swap', description: 'Trade tokens' },
  { route: Routes.LIMIT_ORDER, label: 'Limit', fullLabel: 'Limit order', description: 'Set your own price' },
  { route: Routes.ADVANCED_ORDERS, label: 'TWAP', description: 'Place orders with a time-weighted average price' },
]

export const HOOKS_STORE_MENU_ITEM: IMenuItem = {
  route: Routes.HOOKS,
  label: 'Hooks',
  description: 'Powerful tool to generate pre/post interaction for CoW Protocol',
  badgeImage: EXPERIMENT_ICON,
  badgeType: BadgeTypes.INFORMATION,
}

export const YIELD_MENU_ITEM: IMenuItem = {
  route: Routes.YIELD,
  label: 'Yield',
  fullLabel: 'Yield',
  description: 'Provide liquidity',
  badge: 'New',
  badgeType: BadgeTypes.ALERT,
}
