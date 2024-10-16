import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const COMMENTS_BEFORE_PARAMS = ` Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"`

export const PROVIDER_PARAM_COMMENT =
  'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com'

export const COMMENTS_BY_PARAM_NAME: Record<string, string> = {
  appCode: 'Name of your app (max 50 characters)',
  width: 'Width in pixels (or 100% to use all available space)',
  chainId: '1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)',
  tokenLists: 'All default enabled token lists. Also see https://tokenlists.org',
  theme: 'light/dark or provide your own color palette',
  tradeType: 'swap, limit or advanced',
  sell: 'Sell token. Optionally add amount for sell orders',
  buy: 'Buy token. Optionally add amount for buy orders',
  enabledTradeTypes: 'swap, limit, advanced, yield',
  partnerFee: 'Partner fee, in Basis Points (BPS) and a receiver address',
}

export const COMMENTS_BY_PARAM_NAME_TYPESCRIPT: Record<string, string> = {
  tradeType: 'TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED',
  enabledTradeTypes: 'TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED',
}

export const SANITIZE_PARAMS = {
  appCode: 'My Cool App',
}

export const REMOVE_PARAMS: (keyof CowSwapWidgetParams)[] = ['baseUrl']

export const REACT_IMPORT_STATEMENT = `import { CowSwapWidget, CowSwapWidgetParams, TradeType }`
export const IMPORT_STATEMENT = `import { createCowSwapWidget, CowSwapWidgetParams, TradeType }`
