import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'

import type { BalancesAndAllowances } from '../types'

export function useBalancesAndAllowances(): BalancesAndAllowances {
  const balancesState = useTokensBalances()

  return useMemo(() => {
    const { isLoading: balancesLoading, values: balances } = balancesState
    return {
      isLoading: balancesLoading,
      balances,
    }
  }, [balancesState])
}
