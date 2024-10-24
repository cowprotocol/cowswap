export type Command = () => void

export type StatefulValue<T> = [T, (value: T) => void]

/**
 * UI order type that is different from existing types or classes
 *
 * This concept doesn't match what the API returns, as it has no notion of advanced/twap orders
 * It uses order appData if available, otherwise fallback to less reliable ways
 */
export enum UiOrderType {
  SWAP = 'SWAP',
  LIMIT = 'LIMIT',
  TWAP = 'TWAP',
  HOOKS = 'HOOKS',
  YIELD = 'YIELD',
}

export type TokenInfo = {
  chainId: number
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI?: string
  tokens?: string[]
  lpTokenProvider?: LpTokenProvider
}

export enum LpTokenProvider {
  COW_AMM = 'COW_AMM',
  UNIV2 = 'UNIV2',
  CURVE = 'CURVE',
  BALANCERV2 = 'BALANCERV2',
  SUSHI = 'SUSHI',
  PANCAKE = 'PANCAKE',
}
