import { atom } from 'jotai'

import { CancellableOrder } from '../../utils/isOrderCancellable'
import { isOrderOffChainCancellable } from '../../utils/isOrderOffChainCancellable'

export const ordersToCancelAtom = atom<CancellableOrder[]>([])

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: CancellableOrder[]) => {
  set(ordersToCancelAtom, () => {
    return nextState.filter(isOrderOffChainCancellable)
  })
})

export const removeOrdersToCancelAtom = atom(null, (get, set, ordersUids: string[]) => {
  set(ordersToCancelAtom, () => {
    const state = get(ordersToCancelAtom)

    return state.filter((item) => !ordersUids.includes(item.id))
  })
})
