import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

export interface AdvancedOrdersDerivedState extends TradeDerivedState {
  readonly isUnlocked: boolean
}

export interface AdvancedOrdersRawState extends ExtendedTradeRawState {
  readonly isUnlocked: boolean
}

export function getDefaultAdvancedOrdersState(chainId: SupportedChainId | null): AdvancedOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

export const advancedOrdersAtom = atomWithStorage<AdvancedOrdersRawState>(
  'advanced-orders-atom:v1',
  getDefaultAdvancedOrdersState(null),
  getJotaiIsolatedStorage()
)

export const updateAdvancedOrdersAtom = atom(null, (get, set, nextState: Partial<AdvancedOrdersRawState>) => {
  set(advancedOrdersAtom, () => {
    const prevState = get(advancedOrdersAtom)

    return { ...prevState, ...nextState }
  })
})

export const advancedOrdersDerivedStateAtom = atom<AdvancedOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})
