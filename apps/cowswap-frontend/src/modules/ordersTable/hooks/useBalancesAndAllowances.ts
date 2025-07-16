import { useMemo } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'

import { BalancesAndAllowances } from 'common/types'

import { useTokenAllowances } from './useTokenAllowances'

export function useBalancesAndAllowances(): BalancesAndAllowances {
  const balancesState = useTokensBalances()
  const allowancesState = useTokenAllowances()

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
