import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export interface OnchainState<T> {
  value: T
  loading: boolean
  syncing: boolean
  error: boolean
  valid: boolean
}

export type OnchainTokenAmount = OnchainState<CurrencyAmount<Token> | undefined>

export type TokenAmounts = {
  [tokenAddress: string]: OnchainTokenAmount
}

export type TokenAmountsResult = {
  amounts: TokenAmounts
  isLoading: boolean
}

export interface BalancesAndAllowancesParams {
  account: string | undefined
  spender: string | undefined
  tokens: Token[]
  blocksPerFetchBalance?: number
  blocksPerFetchAllowance?: number
}

export interface BalancesAndAllowances {
  balances: TokenAmounts
  allowances: TokenAmounts
  isLoading: boolean
}
