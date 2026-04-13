import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const COMMENTS_BEFORE_PARAMS = ` Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"`

export const PROVIDER_PARAM_COMMENT =
  'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com'

export const COMMENTS_BY_PARAM_NAME: Partial<Record<keyof CowSwapWidgetParams, string>> = {
  appCode: 'Name of your app (max 50 characters)',
  width: 'Outer iFrame width (use 100% to fill the available container width)',
  chainId: '1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)',
  tokenLists: 'All default enabled token lists. Also see https://tokenlists.org',
  sellTokenLists: 'Token lists available only in the sell selector',
  buyTokenLists: 'Token lists available only in the buy selector',
  theme: 'light/dark or provide your own color palette',
  iframeStyle:
    'Host iframe CSS (e.g. backgroundColor, borderRadius, boxShadow, border). Width/height use top-level width & height.',
  appWrapperStyle: 'Optional inline styles on the top-level app wrapper (inside the iframe)',
  bodyWrapperStyle: 'Optional inline styles on the body wrapper (inside the iframe)',
  cardStyle: 'Optional inline styles on the main trade widget card (inside the iframe)',
  tradeType: 'swap, limit or advanced',
  sell: 'Sell token. Optionally add amount for sell orders',
  buy: 'Buy token. Optionally add amount for buy orders',
  enabledTradeTypes: 'swap, limit, advanced, yield',
  partnerFee: 'Partner fee, in Basis Points (BPS) and a receiver address',
  hideRecentTokens: 'Hide the Recent section in the token selector',
  hideFavoriteTokens: 'Hide the Favorites section in the token selector',
  baseUrl: 'URL of the CoW Swap app inside the widget iframe (defaults to production if omitted in embed code)',
  disablePostTradeTips: 'Hide CoW Swap educational tips shown after a completed trade when there is no surplus card',
}

export const COMMENTS_BY_PARAM_NAME_TYPESCRIPT: Record<string, string> = {
  tradeType: 'TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED',
  enabledTradeTypes: 'TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED',
}

export const SANITIZE_PARAMS = {
  appCode: 'My Cool App',
} as const

export const WIDGET_CONFIGURATOR_DEFAULT_BASE_URL = 'https://swap.cow.fi'

export const REACT_IMPORT_STATEMENT = `import { CowSwapWidget, CowSwapWidgetParams, TradeType }`
export const IMPORT_STATEMENT = `import { createCowSwapWidget, CowSwapWidgetParams, TradeType }`
