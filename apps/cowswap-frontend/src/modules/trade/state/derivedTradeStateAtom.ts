import { atom } from 'jotai'

import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { limitOrdersDerivedStateAtom } from 'modules/limitOrders'
import { swapDerivedStateAtom } from 'modules/swap'
import { yieldDerivedStateAtom } from 'modules/yield'

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
