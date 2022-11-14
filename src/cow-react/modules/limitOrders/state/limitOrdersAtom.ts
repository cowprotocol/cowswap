import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { atom } from 'jotai'
import { OrderKind } from '@cowprotocol/contracts'

export interface LimitOrdersState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly recipient: string | null
  readonly orderKind: OrderKind
  readonly isUnlocked: boolean
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersState {
  return {
    chainId,
    inputCurrencyId: chainId ? WETH[chainId]?.symbol || null : null,
    outputCurrencyId: null,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    recipient: null,
    orderKind: OrderKind.SELL,
    isUnlocked: false,
  }
}

export const limitOrdersAtom = atomWithStorage<LimitOrdersState>('limit-orders-atom', getDefaultLimitOrdersState(null))

export const updateLimitOrdersAtom = atom(null, (get, set, nextState: Partial<LimitOrdersState>) => {
  set(limitOrdersAtom, () => {
    const prevState = get(limitOrdersAtom)

    return { ...prevState, ...nextState }
  })
})
