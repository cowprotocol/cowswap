import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { getDefaultTradeState } from '@cow/modules/trade/types/TradeState'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { atom } from 'jotai'

export interface AdvancedOrdersState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly recipient: string | null
  readonly orderKind: OrderKind
}

export function getDefaultAdvancedOrdersState(chainId: SupportedChainId | null): AdvancedOrdersState {
  return {
    ...getDefaultTradeState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    recipient: null,
    orderKind: OrderKind.SELL,
  }
}

export const advancedOrdersAtom = atomWithStorage<AdvancedOrdersState>(
  'advanced-orders-atom:v1',
  getDefaultAdvancedOrdersState(null),
  /**
   * atomWithStorage() has build-in feature to persist state between all tabs
   * To disable this feature we pass our own instance of storage
   * https://github.com/pmndrs/jotai/pull/1004/files
   */
  createJSONStorage(() => localStorage)
)

export const updateAdvancedOrdersAtom = atom(null, (get, set, nextState: Partial<AdvancedOrdersState>) => {
  set(advancedOrdersAtom, () => {
    const prevState = get(advancedOrdersAtom)

    return { ...prevState, ...nextState }
  })
})
