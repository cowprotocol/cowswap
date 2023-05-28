import { atom } from 'jotai'

import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'
import { Order } from 'legacy/state/orders/actions'

export const ordersToCancelAtom = atom<Order[]>([])

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: Order[]) => {
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
