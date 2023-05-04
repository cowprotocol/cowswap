import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExtendedTradeRawState, getDefaultTradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from '@cow/modules/trade/types/TradeDerivedState'

export interface AdvancedOrdersRawState extends ExtendedTradeRawState {}

export function getDefaultAdvancedOrdersState(chainId: SupportedChainId | null): AdvancedOrdersRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
  }
}

export const advancedOrdersAtom = atomWithStorage<AdvancedOrdersRawState>(
  'advanced-orders-atom:v1',
  getDefaultAdvancedOrdersState(null),
  /**
   * atomWithStorage() has build-in feature to persist state between all tabs
   * To disable this feature we pass our own instance of storage
   * https://github.com/pmndrs/jotai/pull/1004/files
   */
  createJSONStorage(() => localStorage)
)

export const updateAdvancedOrdersAtom = atom(null, (get, set, nextState: Partial<AdvancedOrdersRawState>) => {
  set(advancedOrdersAtom, () => {
    const prevState = get(advancedOrdersAtom)

    return { ...prevState, ...nextState }
  })
})

export const advancedOrdersDerivedStateAtom = atom<TradeDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
})
