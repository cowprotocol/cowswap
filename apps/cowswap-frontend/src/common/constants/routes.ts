import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { BadgeTypes } from '@cowprotocol/ui'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'

export const TRADE_WIDGET_PREFIX = isInjectedWidget() ? '/widget' : ''

export const Routes = {
  HOME: '/',
  SWAP: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/:inputCurrencyId?/:outputCurrencyId?`,
  HOOKS: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/hooks/:inputCurrencyId?/:outputCurrencyId?`,
  LIMIT_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/limit/:inputCurrencyId?/:outputCurrencyId?`,
  YIELD: `/:chainId?${TRADE_WIDGET_PREFIX}/yield/:inputCurrencyId?/:outputCurrencyId?`,
  ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit-orders/:inputCurrencyId?/:outputCurrencyId?`,
  LONG_ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced-orders/:inputCurrencyId?/:outputCurrencyId?`,
  ACCOUNT_PROXIES: '/account/:chainId/account-proxy',
  ACCOUNT_PROXY: '/account/:chainId/account-proxy/:proxyAddress',
  ACCOUNT_PROXY_RECOVER: '/account/:chainId/account-proxy/:proxyAddress/recover/:tokenAddress',
  ACCOUNT_PROXY_HELP: '/account/:chainId/account-proxy/help',
  LEGACY_ACCOUNT_PROXIES: '/:chainId/account-proxy',
  LEGACY_ACCOUNT_PROXY: '/:chainId/account-proxy/:proxyAddress',
  LEGACY_ACCOUNT_PROXY_RECOVER: '/:chainId/account-proxy/:proxyAddress/recover/:tokenAddress',
  LEGACY_ACCOUNT_PROXY_HELP: '/:chainId/account-proxy/help',
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

export interface I18nIMenuItem extends Omit<IMenuItem, 'label' | 'fullLabel' | 'description' | 'badge'> {
  label: MessageDescriptor
  fullLabel?: MessageDescriptor
  description: MessageDescriptor
  badge?: MessageDescriptor
}

export const MENU_ITEMS: I18nIMenuItem[] = [
  {
    route: Routes.SWAP,
    label: msg`Swap`,
    description: msg`Trade tokens`,
  },
  {
    route: Routes.LIMIT_ORDERS,
    label: msg`Limit`,
    fullLabel: msg`Limit order`,
    description: msg`Set your own price`,
  },
  {
    route: Routes.ADVANCED_ORDERS,
    label: msg`TWAP`,
    description: msg`Place orders with a time-weighted average price`,
  },
]

export const HOOKS_STORE_MENU_ITEM: I18nIMenuItem = {
  route: Routes.HOOKS,
  label: msg`Hooks`,
  description: msg`Powerful tool to generate pre/post interaction for CoW Protocol`,
  badgeImage: EXPERIMENT_ICON,
  badgeType: BadgeTypes.INFORMATION,
}

export const YIELD_MENU_ITEM: I18nIMenuItem = {
  route: Routes.YIELD,
  label: msg`Yield`,
  fullLabel: msg`Yield`,
  description: msg`Provide liquidity`,
  badge: msg`New`,
  badgeType: BadgeTypes.ALERT,
}
