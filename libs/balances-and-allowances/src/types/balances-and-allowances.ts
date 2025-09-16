import type { BigNumber } from '@ethersproject/bignumber'

export interface BalancesAndAllowances {
  balances: Record<string, BigNumber | undefined>
  allowances?: Record<string, BigNumber | undefined>
  isLoading: boolean
}
