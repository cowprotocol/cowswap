import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExtendedTradeRawState, getDefaultTradeRawState } from 'modules/trade/types/TradeRawState'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { DEFAULT_TRADE_DERIVED_STATE, TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

export function getDefaultAdvancedOrdersState(chainId: SupportedChainId | null): ExtendedTradeRawState {
  return {
    ...getDefaultTradeRawState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    orderKind: OrderKind.SELL,
  }
}

export const advancedOrdersAtom = atomWithStorage<ExtendedTradeRawState>(
  'advanced-orders-atom:v1',
  getDefaultAdvancedOrdersState(null),
  /**
   * atomWithStorage() has build-in feature to persist state between all tabs
   * To disable this feature we pass our own instance of storage
   * https://github.com/pmndrs/jotai/pull/1004/files
   */
  createJSONStorage(() => localStorage)
)

export const updateAdvancedOrdersAtom = atom(null, (get, set, nextState: Partial<ExtendedTradeRawState>) => {
  set(advancedOrdersAtom, () => {
    const prevState = get(advancedOrdersAtom)

    return { ...prevState, ...nextState }
  })
})

export const advancedOrdersDerivedStateAtom = atom<TradeDerivedState>({
  ...DEFAULT_TRADE_DERIVED_STATE,
})
