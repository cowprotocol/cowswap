import { useMemo } from 'react'

import { useTokenAllowances } from './useTokenAllowances'
import { useTokensBalances } from './useTokensBalances'

import { BalancesAndAllowances } from '../types/balances-and-allowances'

export function useBalancesAndAllowances(tokens: string[]): BalancesAndAllowances {
  const balancesState = useTokensBalances()
  const allowancesState = useTokenAllowances(tokens)

  return useMemo(() => {
    const { isLoading: balancesLoading, values: balances } = balancesState
    const { isLoading: allowancesLoading, state: allowances } = allowancesState
    return {
      isLoading: balancesLoading || allowancesLoading,
      balances,
      allowances,
    }
  }, [balancesState, allowancesState])
}
