import { useMemo } from 'react'

import { LpToken } from '@cowprotocol/common-const'

import { useYieldDerivedState } from './useYieldDerivedState'

export enum YieldFormState {
  Erc20BuyIsNotAllowed = 'Erc20BuyIsNotAllowed',
}

export function useYieldFormState(): YieldFormState | null {
  const state = useYieldDerivedState()

  return useMemo(() => {
    if (state.outputCurrency && !(state.outputCurrency instanceof LpToken)) {
      return YieldFormState.Erc20BuyIsNotAllowed
    }

    return null
  }, [state])
}
