import { AllowancesState, BalancesState } from '@cowprotocol/balances-and-allowances'
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
  account: string | undefined
  spender: string | undefined
  tokens: Token[]
  blocksPerFetchBalance?: number
  blocksPerFetchAllowance?: number
}

export interface BalancesAndAllowances {
  balances: BalancesState['values']
  allowances: AllowancesState['values']
  isLoading: boolean
}
