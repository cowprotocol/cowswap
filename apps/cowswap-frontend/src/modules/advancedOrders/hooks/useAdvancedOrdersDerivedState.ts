import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { Percent } from '@cowprotocol/currency'

import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

import { TradeType } from 'common/modules/tradeNavigation'

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
  const isUnlocked = rawState.isUnlocked || isInjectedWidget()

  return useMemo(() => {
    return { ...derivedState, isUnlocked, slippage, tradeType: TradeType.ADVANCED_ORDERS }
  }, [derivedState, isUnlocked, slippage])
}
