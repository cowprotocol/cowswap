import { isInjectedWidget } from 'common/utils/isInjectedWidget'

export const TRADE_WIDGET_PREFIX = isInjectedWidget() ? '/widget' : ''

export const Routes = {
  HOME: '/',
  SWAP: `/:chainId?${TRADE_WIDGET_PREFIX}/swap/:inputCurrencyId?/:outputCurrencyId?`,
  LIMIT_ORDER: `/:chainId?${TRADE_WIDGET_PREFIX}/limit-orders/:inputCurrencyId?/:outputCurrencyId?`,
  ADVANCED_ORDERS: `/:chainId?${TRADE_WIDGET_PREFIX}/advanced-orders/:inputCurrencyId?/:outputCurrencyId?`,
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
  KITCHEN_SINK: '/kitchen-sink',
} as const

export type RoutesKeys = keyof typeof Routes
export type RoutesValues = (typeof Routes)[RoutesKeys]
