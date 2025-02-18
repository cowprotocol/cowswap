import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai/index'
import { useEffect } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'

import { swapDerivedStateAtom, swapRawStateAtom } from '../state/swapRawStateAtom'

export function useSwapDerivedState() {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState() {
  const updateDerivedState = useSetAtom(swapDerivedStateAtom)
  const derivedState = useBuildTradeDerivedState(swapRawStateAtom)

  useEffect(() => {
    updateDerivedState({
      ...derivedState,
      slippage: INITIAL_ALLOWED_SLIPPAGE_PERCENT,
      tradeType: TradeType.YIELD,
    })
  }, [derivedState, updateDerivedState])
}
