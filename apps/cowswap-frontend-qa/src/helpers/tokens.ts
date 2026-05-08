export const MAINNET_CHAIN_ID = 1
export const MAINNET_ETH = 'ETH'
export const MAINNET_COW_VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
export const MAINNET_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const MAINNET_WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

export type MainnetCurrencyId = string

export interface MainnetSwapRouteParams {
  buyAmount?: string
  orderKind?: 'buy' | 'sell'
  sellAmount?: string
}

export function buildMainnetSwapRoute(
  sellToken: MainnetCurrencyId,
  buyToken: MainnetCurrencyId,
  params: MainnetSwapRouteParams = {},
): string {
  const searchParams = new URLSearchParams()

  if (params.sellAmount) {
    searchParams.set('sellAmount', params.sellAmount)
  }

  if (params.buyAmount) {
    searchParams.set('buyAmount', params.buyAmount)
  }

  if (params.orderKind) {
    searchParams.set('orderKind', params.orderKind)
  }

  const route = `/#/${MAINNET_CHAIN_ID}/swap/${sellToken}/${buyToken}`
  const queryString = searchParams.toString()

  return queryString ? `${route}?${queryString}` : route
}
