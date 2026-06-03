import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const COMMENTS_BEFORE_PARAMS = ` Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"`

export const PROVIDER_PARAM_COMMENT_LINES = [
  'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`,',
  'but consider using something like https://web3modal.com',
] as const

export const PROVIDER_PARAM_COMMENT = PROVIDER_PARAM_COMMENT_LINES.map((line) => `// ${line}`).join('\n')

export const COMMENTS_BY_PARAM_NAME: Partial<Record<keyof CowSwapWidgetParams, string>> = {
  // Basics:

  appCode: 'Name of your app (max 50 characters)',

  // Trade Setup:

  enabledTradeTypes: 'swap, limit, advanced, yield',
  chainId: '1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)',
  tradeType: 'swap, limit or advanced',

  // Tokens:

  sell: 'Sell token. Optionally add amount for sell orders',
  buy: 'Buy token. Optionally add amount for buy orders',
  sellTokenLists: 'Token lists available only in the sell selector',
  buyTokenLists: 'Token lists available only in the buy selector',
  tokenLists: 'All default enabled token lists. Also see https://tokenlists.org',

  // Theme Colors:

  theme: 'light/dark or provide your own color palette',

  // Layout:

  iframeStyle:
    'Host iframe CSS (e.g. backgroundColor, borderRadius, boxShadow, border). Width/height use top-level width & height.',
  appWrapperStyle: 'Optional inline styles on the top-level app wrapper (inside the iframe)',
  bodyWrapperStyle: 'Optional inline styles on the body wrapper (inside the iframe)',
  cardStyle: 'Optional inline styles on the main trade widget card (inside the iframe)',
  disableScrollbars:
    'Hide scrollbars inside the widget. Only use with iframe height: var(--dynamicHeight) and no max-height constraint',

  // Behavior:

  disablePostTradeTips: 'Hide CoW Swap educational tips shown after a completed trade when there is no surplus card',
  hideRecentTokens: 'Hide the Recent section in the token selector',
  hideFavoriteTokens: 'Hide the Favorites section in the token selector',

  // Integrations:

  partnerFee: 'Partner fee, in Basis Points (BPS) and a receiver address',

  // Advanced:

  baseUrl: 'URL of the CoW Swap app inside the widget iframe (defaults to production if omitted in embed code)',
}

export const COMMENTS_BY_PARAM_NAME_TYPESCRIPT: Record<string, string> = {
  // Trade Setup:

  tradeType: 'TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED',
  enabledTradeTypes: 'TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED',
}

/** Shown in generated embed snippets when the Basics app code field is empty. */
export const WIDGET_SNIPPET_APP_CODE_PLACEHOLDER = '<YOUR_APP_NAME>'

export const WIDGET_CONFIGURATOR_DEFAULT_BASE_URL = 'https://swap.cow.fi'

export const REACT_IMPORT_STATEMENT = `import { CowSwapWidget, CowSwapWidgetParams, TradeType }`
export const IMPORT_STATEMENT = `import { createCowSwapWidget, CowSwapWidgetParams, TradeType }`
