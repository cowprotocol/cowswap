import type { BigNumber } from '@ethersproject/bignumber'

export interface BalancesAndAllowances {
  balances: Record<string, bigint | undefined>
  allowances?: Record<string, BigNumber | undefined>
  isLoading: boolean
}
