import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const COMMENTS_BEFORE_PARAMS = ` Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"`

export const COMMENTS_BY_PARAM_NAME: Record<string, string> = {
  appCode: 'Name of your app (max 50 characters)',
  width: 'Width in pixels (or 100% to use all available space)',
  provider:
    'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com',
  chainId: '1 (Mainnet), 5 (Goerli), 100 (Gnosis)',
  theme: 'light/dark or provide your own color palette',
  tradeType: 'swap, limit or advanced',
  sell: 'Sell token. Optionally add amount for sell orders',
  buy: 'Buy token. Optionally add amount for buy orders',
  enabledTradeTypes: 'swap, limit and/or advanced',
  interfaceFeeBips: '0.5% - COMING SOON! Fill the form above if you are interested',
}

export const COMMENTS_BY_PARAM_NAME_TYPESCRIPT: Record<string, string> = {
  tradeType: 'TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED',
  enabledTradeTypes: 'TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED',
}

export const VALUES_BY_PARAM_NAME: Record<string, string> = {
  provider: 'window.ethereum',
}

export const SANITIZE_PARAMS = {
  appCode: 'My Cool App',
  provider: 'EIP-1271 Provider',
  interfaceFeeBips: '50',
}

export const REMOVE_PARAMS: (keyof CowSwapWidgetParams)[] = ['env']

export const IMPORT_STATEMENT = `import { CowSwapWidget, CowSwapWidgetParams, TradeType }`
