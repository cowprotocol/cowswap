import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { BadgeTypes } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

export const TRADE_WIDGET_PREFIX = isInjectedWidget() ? '/widget' : ''

export const Routes = {
  HOME: '/',
  SWAP: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/:inputCurrencyId?/:outputCurrencyId?`,
  HOOKS: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/hooks/:inputCurrencyId?/:outputCurrencyId?`,
  LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit/:inputCurrencyId?/:outputCurrencyId?`,
  YIELD: `/:chainId?${TRADE_WIDGET_PREFIX}/yield/:inputCurrencyId?/:outputCurrencyId?`,
  ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit-orders/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced-orders/:inputCurrencyId?/:outputCurrencyId?`,
  ACCOUNT_PROXIES: '/:chainId/account-proxy',
  ACCOUNT_PROXY: '/:chainId/account-proxy/:proxyAddress',
  ACCOUNT_PROXY_RECOVER: '/:chainId/account-proxy/:proxyAddress/recover/:tokenAddress',
  ACCOUNT_PROXY_HELP: '/:chainId/account-proxy/help',
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

export const getMenuItems = (): IMenuItem[] => [
  { route: Routes.SWAP, label: t`Swap`, description: t`Trade tokens` },
  { route: Routes.LIMIT_ORDER, label: t`Limit`, fullLabel: t`Limit order`, description: t`Set your own price` },
  { route: Routes.ADVANCED_ORDERS, label: `TWAP`, description: `Place orders with a time-weighted average price` },
]

export const MENU_ITEMS: IMenuItem[] = getMenuItems()

const getHookStoreMenuItem = (): IMenuItem => ({
  route: Routes.HOOKS,
  label: t`Hooks`,
  description: t`Powerful tool to generate pre/post interaction for CoW Protocol`,
  badgeImage: EXPERIMENT_ICON,
  badgeType: BadgeTypes.INFORMATION,
})

export const HOOKS_STORE_MENU_ITEM: IMenuItem = getHookStoreMenuItem()

export const getYieldMenuItem = (): IMenuItem => ({
  route: Routes.YIELD,
  label: t`Yield`,
  fullLabel: `Yield`,
  description: `Provide liquidity`,
  badge: `New`,
  badgeType: BadgeTypes.ALERT,
})

export const YIELD_MENU_ITEM = getYieldMenuItem()
