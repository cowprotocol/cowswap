export interface BalancesAndAllowances {
  balances: Record<string, bigint | undefined>
  allowances?: Record<string, bigint | undefined>
  isLoading: boolean
}
