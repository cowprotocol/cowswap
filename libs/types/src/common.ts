import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type Command = () => void

export type StatefulValue<T> = [T, (value: T) => void]

export type Nullish<T> = T | null | undefined
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
  tags?: string[]
}

export enum LpTokenProvider {
  COW_AMM = 'COW_AMM',
  UNIV2 = 'UNIV2',
  CURVE = 'CURVE',
  BALANCERV2 = 'BALANCERV2',
  SUSHI = 'SUSHI',
  PANCAKE = 'PANCAKE',
}

/**
 * This helper type allows to define a state that is persisted by chain.
 *
 * For a lot of constants in the project we use Record<SupportedChainId, T> to model them, so when we add new chains, we will get a compile time error until we update the new value for the added chain.
 * This patter is fine for this configuration constants.
 *
 * However, we can't use the same pattern for modeling persisted state (in local storage for example).
 * The reason is that when a user recovers a persisted value from an older version where a chain didn't exist, it will return `undefined` when we try to access the value for the new chain.
 * The type won't be correct, and typescript will make us assume that the value is always defined leading to hard to debug runtime errors.
 */
export type PersistentStateByChain<T> = Record<SupportedChainId, T | undefined>
