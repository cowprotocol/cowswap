import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { ExtendedTradeRawState, getDefaultTradeRawState } from '@cow/modules/trade/types/TradeRawState'
import { DEFAULT_TRADE_FULL_STATE, TradeFullState } from '@cow/modules/trade/types/TradeFullState'

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

export const limitOrdersFullStateAtom = atom<LimitOrdersFullState>({
  ...DEFAULT_TRADE_FULL_STATE,
  isUnlocked: true,
})
