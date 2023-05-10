import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { ExtendedTradeRawState, getDefaultTradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from '@cow/modules/trade/types/TradeDerivedState'

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
  /**
   * atomWithStorage() has build-in feature to persist state between all tabs
   * To disable this feature we pass our own instance of storage
   * https://github.com/pmndrs/jotai/pull/1004/files
   */
  createJSONStorage(() => localStorage)
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
