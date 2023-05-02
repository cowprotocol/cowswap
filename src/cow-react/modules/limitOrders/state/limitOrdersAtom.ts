import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { ExtendedTradeRawState, getDefaultTradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { getDefaultTradeFullState, TradeFullState } from '@cow/modules/trade/types/TradeFullState'

export interface LimitOrdersFullState extends TradeFullState {
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

export const limitOrdersFullStateAtom = atom<LimitOrdersFullState>({
  ...getDefaultTradeFullState(),
  isUnlocked: true,
})
