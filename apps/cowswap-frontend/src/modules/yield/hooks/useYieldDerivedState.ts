import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'

import { yieldDerivedStateAtom, yieldRawStateAtom } from '../state/yieldRawStateAtom'

export function useYieldDerivedState() {
  return useAtomValue(yieldDerivedStateAtom)
}

export function useFillYieldDerivedState() {
  const updateDerivedState = useSetAtom(yieldDerivedStateAtom)
  const derivedState = useBuildTradeDerivedState(yieldRawStateAtom, false)

  useEffect(() => {
    updateDerivedState({
      ...derivedState,
      slippage: INITIAL_ALLOWED_SLIPPAGE_PERCENT,
      tradeType: TradeType.YIELD,
    })
  }, [derivedState, updateDerivedState])
}
