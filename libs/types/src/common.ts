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
  isLpToken?: boolean
  isCoWAmmToken?: boolean
}
