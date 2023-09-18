import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export interface OnchainState<T> {
  /**
   * Result value for a RPC call
   */
  value: T

  /**
   * True if the result has never been fetched. False otherwise
   */
  loading: boolean

  /**
   * True if the result is not from the last block
   */
  syncing: boolean

  /**
   * True if the call was made, is synced and valid
   */
  valid: boolean

  /**
   * True if the call was made and is synced, but the return data is invalid
   */
  error: boolean
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
  /**
   * Account to fetch the balances and allowances for
   */
  account: string | undefined

  /**
   * Spender account to check the allowance for the given account. Undefined if the allowance is not required
   */
  spender: string | undefined

  /**
   * List of tokens to get the balance and allowance for
   */
  tokens: Token[]

  /**
   * Number of blocks to wait between each balance polling
   */
  blocksPerFetchBalance?: number

  /**
   * Number of blocks to wait between each allowance polling
   */
  blocksPerFetchAllowance?: number
}

export interface BalancesAndAllowances {
  balances: TokenAmounts
  allowances: TokenAmounts
  isLoading: boolean
}
