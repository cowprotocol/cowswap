import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

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

export function useAdvancedOrdersDerivedStateToFill(slippage: Percent): AdvancedOrdersDerivedState {
  const rawState = useAtomValue(advancedOrdersAtom)

  const derivedState = useBuildTradeDerivedState(advancedOrdersAtom, false)
  const isUnlocked = rawState.isUnlocked

  return useMemo(() => {
    return { ...derivedState, isUnlocked, slippage, tradeType: TradeType.ADVANCED_ORDERS }
  }, [derivedState, isUnlocked, slippage])
}
