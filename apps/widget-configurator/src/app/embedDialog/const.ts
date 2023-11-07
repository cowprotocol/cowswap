import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export const COMMENTS_BEFORE_PARAMS = ` Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appKey"`

export const COMMENTS_BY_PARAM_NAME: Record<string, string> = {
  appKey: 'Name of your app (max 50 characters, e.g. "Pig Swap")',
  width: 'Width in pixels (or 100% to use all available space)',
  provider:
    'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com',
  chainId: '1 (Mainnet), 5 (Goerli), 100 (Gnosis)',
  theme: 'light or dark',
  tradeType: 'swap, limit or advanced',
  tradeAssets: 'Selected assets and amounts (e.g. COW-USDC)',
  enabledTradeTypes: 'swap, limit and/or advanced',
  partnerFeeBips: 'Fill the form above if you are interested',
}

export const VALUES_BY_PARAM_NAME: Record<string, string> = {
  provider: 'window.ethereum',
}

export const SANITIZE_PARAMS = {
  provider: 'EIP-1271 Provider',
  partnerFeeBips: '50',
}

export const REMOVE_PARAMS: (keyof CowSwapWidgetParams)[] = ['env']
