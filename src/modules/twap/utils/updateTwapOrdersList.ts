import { TWAP_PENDING_STATUSES } from '../const'
import { TwapOrdersList } from '../state/twapOrdersListAtom'
import { TwapOrderStatus } from '../types'

/**
 *
 * This function merge current state of TWAP orders list with a new one
 * It only updates an order if it in a pending state
 */
export function updateTwapOrdersList(currentState: TwapOrdersList, nextState: TwapOrdersList): TwapOrdersList {
  // Filter nextState and left only orders with pending statuses
  const newState = Object.keys(nextState).reduce<TwapOrdersList>((acc, orderId) => {
    const currentOrder = currentState[orderId]
    const newOrder = nextState[orderId]

    // Insert an order if it's not exist in the state
    // Update an order only if it's in pending state or a new state is Fulfilled
    // Otherwise, don't update it
    if (
      !currentOrder ||
      TWAP_PENDING_STATUSES.includes(currentOrder.status) ||
      newOrder.status === TwapOrderStatus.Fulfilled
    ) {
      acc[orderId] = newOrder
    }

    return acc
  }, {})

  return { ...currentState, ...newState }
}
