import { atom } from 'jotai'

/**
 * TODO: Trade module should not depend on trading widget modules!
 * The dependency must be inverted.
 * For now I only changed imports to specific files to avoid circular dependencies.
 */
import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders/state/advancedOrdersAtom'
import { limitOrdersDerivedStateAtom } from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { swapDerivedStateAtom } from 'modules/swap/state/swapRawStateAtom'
import { yieldDerivedStateAtom } from 'modules/yield/state/yieldRawStateAtom'

import { tradeTypeAtom } from './tradeTypeAtom'

import { TradeDerivedState, TradeType } from '../types'

export const derivedTradeStateAtom = atom<TradeDerivedState | null>((get) => {
  const tradeTypeInfo = get(tradeTypeAtom)

  if (!tradeTypeInfo) return null

  if (tradeTypeInfo.tradeType === TradeType.SWAP) {
    return get(swapDerivedStateAtom)
  }

  if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
    return get(advancedOrdersDerivedStateAtom)
  }

  if (tradeTypeInfo.tradeType === TradeType.YIELD) {
    return get(yieldDerivedStateAtom)
  }

  return get(limitOrdersDerivedStateAtom)
})
