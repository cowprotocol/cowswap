export type Command = () => void

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
}

export type TokenInfo = {
  chainId: number
  address: string
  name: string
  decimals: number
  symbol: string
  logoURI?: string
}
