import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Percent } from '@uniswap/sdk-core'

import { TradeType } from 'modules/trade'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

import {
  advancedOrdersAtom,
  AdvancedOrdersDerivedState,
  advancedOrdersDerivedStateAtom,
} from '../state/advancedOrdersAtom'

export function useAdvancedOrdersDerivedState(): AdvancedOrdersDerivedState {
  return useAtomValue(advancedOrdersDerivedStateAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFillAdvancedOrdersDerivedState(slippage: Percent) {
  const rawState = useAtomValue(advancedOrdersAtom)
  const updateDerivedState = useSetAtom(advancedOrdersDerivedStateAtom)

  const derivedState = useBuildTradeDerivedState(advancedOrdersAtom, false)
  const isUnlocked = rawState.isUnlocked

  useEffect(() => {
    updateDerivedState({ ...derivedState, isUnlocked, slippage, tradeType: TradeType.ADVANCED_ORDERS })
  }, [derivedState, isUnlocked, updateDerivedState, slippage])
}
