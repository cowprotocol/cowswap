import { BalancesState } from '@cowprotocol/balances-and-allowances'

export interface BalancesAndAllowances {
  balances: BalancesState['values']
  isLoading: boolean
}
