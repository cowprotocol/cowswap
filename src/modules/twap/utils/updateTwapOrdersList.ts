import { TWAP_NOT_PENDING_STATUSES } from '../const'
import { TwapOrdersList } from '../state/twapOrdersListAtom'

export function updateTwapOrdersList(currentState: TwapOrdersList, nextState: TwapOrdersList): TwapOrdersList {
  const newState = { ...currentState, ...nextState }

  Object.keys(nextState).forEach((orderId) => {
    const currentOrder = currentState[orderId]

    // Don't update orders in final statuses
    if (currentOrder && TWAP_NOT_PENDING_STATUSES.includes(currentOrder.status)) {
      newState[orderId] = currentOrder
    }
  })

  return newState
}
