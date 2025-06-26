import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from '@cowprotocol/common-const'

import { TradeType, useBuildTradeDerivedState } from 'modules/trade'

import { yieldDerivedStateAtom, yieldRawStateAtom } from '../state/yieldRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useYieldDerivedState() {
  return useAtomValue(yieldDerivedStateAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
