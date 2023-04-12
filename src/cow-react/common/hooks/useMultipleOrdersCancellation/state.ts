import { atom } from 'jotai'
import { Order } from 'state/orders/actions'
import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import { isOrderCancellable } from '@cow/common/utils/isOrderCancellable'

// null - when orders cancellation is not enabled
// [] - when orders cancellation is enabled
export const ordersToCancelAtom = atom<Order[]>([])

export const updateOrdersToCancelAtom = atom(null, (get, set, nextState: Order[]) => {
  set(ordersToCancelAtom, () => {
    return nextState.filter((order) => !getIsEthFlowOrder(order) && isOrderCancellable(order))
  })
})
