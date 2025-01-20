import { AllowancesState, BalancesState } from '@cowprotocol/balances-and-allowances'

export interface BalancesAndAllowances {
  balances: BalancesState['values']
  allowances: AllowancesState['values']
  isLoading: boolean
}
