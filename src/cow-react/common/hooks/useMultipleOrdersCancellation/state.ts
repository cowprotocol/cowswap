import { atom } from 'jotai'
import { Order } from 'state/orders/actions'
import { isOrderOffChainCancellable } from '@cow/common/utils/isOrderOffChainCancellable'

// null - when orders cancellation is not enabled
// [] - when orders cancellation is enabled
export const ordersToCancelAtom = atom<Order[]>([])

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: Order[]) => {
  set(ordersToCancelAtom, () => {
    return nextState.filter(isOrderOffChainCancellable)
  })
})
