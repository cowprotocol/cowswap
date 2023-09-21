import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'

export interface LimitOrdersDerivedState extends TradeDerivedState {
  readonly isUnlocked: boolean
}

export interface LimitOrdersRawState extends ExtendedTradeRawState {
  readonly isUnlocked: boolean
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

export const limitOrdersRawStateAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  getJotaiIsolatedStorage()
)

export const updateLimitOrdersRawStateAtom = atom(null, (get, set, nextState: Partial<LimitOrdersRawState>) => {
  set(limitOrdersRawStateAtom, () => {
    const prevState = get(limitOrdersRawStateAtom)

    return { ...prevState, ...nextState }
  })
})

export const limitOrdersDerivedStateAtom = atom<LimitOrdersDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
  isUnlocked: true,
})
