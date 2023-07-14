import { useOnchainBalancesAndAllowances } from './useOnchainBalances'

import { BalancesAndAllowances, BalancesAndAllowancesParams } from '../types'

/**
 * Return the balances and allowances of the tokens.
 *
 * This hooks is different than the useOnchainBalancesAndAllowance one in the fact that the user might contain some
 * un-commited transaction that might affect the balances.
 */
export function useBalancesAndAllowances(params: BalancesAndAllowancesParams): BalancesAndAllowances {
  const balancesAndAllowances = useOnchainBalancesAndAllowances(params)

  // TODO: This function still has too many re-renders, we shold investigate (for now, focusing on only the re-factor)
  // console.debug('[usebalancesAndAllowances] Get balancesAndAllowances', params, balancesAndAllowances)

  // TODO: Apply all the balance transformations (i.e. bundled tx)

  return balancesAndAllowances
}
