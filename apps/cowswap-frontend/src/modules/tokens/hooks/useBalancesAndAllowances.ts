import { useMemo } from 'react'

import { useTokensAllowances, useTokensBalances } from '@cowprotocol/balances-and-allowances'

import type { BalancesAndAllowances } from '../types'

export function useBalancesAndAllowances(): BalancesAndAllowances {
  const balancesState = useTokensBalances()
  const allowancesState = useTokensAllowances()

  return useMemo(() => {
    const { isLoading: balancesLoading, values: balances } = balancesState
    const { isLoading: allowancesLoading, values: allowances } = allowancesState
    return {
      isLoading: balancesLoading || allowancesLoading,
      balances,
      allowances,
    }
  }, [balancesState, allowancesState])
}
