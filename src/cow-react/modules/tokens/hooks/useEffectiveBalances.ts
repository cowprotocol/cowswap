import {
  OnchainBalancesAndAllowances,
  OnchainBalancesAndAllowancesParams,
  useOnchainBalancesAndAllowances,
} from './useOnchainBalances'

export type EffectiveBalancesParams = OnchainBalancesAndAllowancesParams
export type EffectiveBalances = OnchainBalancesAndAllowances

/**
 * Return the balances of the tokens.
 *
 * The effective word refers to the fact that the balances don't necesarilly reflect the tokens the user have.
 * There's some aspects that will influcence the effective balance:
 *    - Allowance: The effective balance will be the minimum between allowance and balance
 *    - Transactions in an uncommited bundle (for gnosis safe users, it modifies the balance assuming the transaction is executed)
 */
export function useEffectiveBalances(params: EffectiveBalancesParams): EffectiveBalances {
  const balancesAndAllowances = useOnchainBalancesAndAllowances(params)

  // TODO: This function still has too many re-renders, we shold investigate (for now, focusing on only the re-factor)
  console.debug('[useEffectiveBalances] Get balancesAndAllowances', params, balancesAndAllowances)

  // TODO: Apply all the balance transformations (i.e. bundled tx)

  return balancesAndAllowances
}
