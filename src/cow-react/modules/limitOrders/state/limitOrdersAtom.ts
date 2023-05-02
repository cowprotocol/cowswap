import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { getDefaultTradeState, TradeRawState } from '@cow/modules/trade/types/TradeRawState'

export interface LimitOrdersRawState extends TradeRawState {
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly orderKind: OrderKind
  readonly isUnlocked: boolean
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersRawState {
  return {
    ...getDefaultTradeState(chainId),
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    recipient: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

export const limitOrdersAtom = atomWithStorage<LimitOrdersRawState>(
  'limit-orders-atom:v4',
  getDefaultLimitOrdersState(null),
  /**
   * atomWithStorage() has build-in feature to persist state between all tabs
   * To disable this feature we pass our own instance of storage
   * https://github.com/pmndrs/jotai/pull/1004/files
   */
  createJSONStorage(() => localStorage)
)

export const updateLimitOrdersAtom = atom(null, (get, set, nextState: Partial<LimitOrdersRawState>) => {
  set(limitOrdersAtom, () => {
    const prevState = get(limitOrdersAtom)

    return { ...prevState, ...nextState }
  })
})
