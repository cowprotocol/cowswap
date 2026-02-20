import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'

import { YieldDerivedState, yieldDerivedStateAtom, yieldRawStateAtom } from '../state/yieldRawStateAtom'

export function useYieldDerivedState(): YieldDerivedState {
  return useAtomValue(yieldDerivedStateAtom)
}

export function useYieldDerivedStateToFill(): YieldDerivedState {
  const derivedState = useBuildTradeDerivedState(yieldRawStateAtom, false)

  return useMemo(() => {
    return {
      ...derivedState,
      slippage: INITIAL_ALLOWED_SLIPPAGE_PERCENT,
      tradeType: TradeType.YIELD,
    }
  }, [derivedState])
}
