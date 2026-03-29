import { deepEqual } from '@cowprotocol/common-utils'

import { TwapOrdersList } from 'entities/twap'

import { TWAP_FINAL_STATUSES } from '../const'
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

    if (currentOrder) {
      if (TWAP_FINAL_STATUSES.includes(currentOrder.status)) {
        if (!deepEqual(currentOrder.executionInfo, newOrder.executionInfo)) {
          acc[orderId] = { ...currentOrder, executionInfo: newOrder.executionInfo }
        }

        return acc
      }

      // If current order is "Cancelling", only preserve that status if:
      // - The new status is also "Cancelling" (transaction still pending)
      // - We don't have a definitive new status yet
      // Otherwise, allow the status to update (either to "Cancelled" if successful,
      // or back to "Pending" if the cancellation transaction was rejected/replaced)
      if (currentOrder.status === TwapOrderStatus.Cancelling) {
        if (newOrder.status === TwapOrderStatus.Cancelled) {
          acc[orderId] = newOrder
        } else if (newOrder.status === TwapOrderStatus.Pending) {
          // Order is still authorized on-chain - cancellation was rejected/failed
          acc[orderId] = newOrder
        }
        return acc
      }
    }

    // Insert an order if it's not exist in the state
    // Update an order only if it's in pending state or a new state is Fulfilled
    // Otherwise, don't update it
    if (!currentOrder || !TWAP_FINAL_STATUSES.includes(currentOrder.status)) {
      acc[orderId] = newOrder
    }

    return acc
  }, {})

  // Handle stale "Cancelling" orders that are NOT in nextState
  Object.keys(currentState).forEach((orderId) => {
    const currentOrder = currentState[orderId]
    const newOrder = nextState[orderId]

    if (currentOrder.status === TwapOrderStatus.Cancelling && !newOrder && !newState[orderId]) {
      newState[orderId] = { ...currentOrder, status: TwapOrderStatus.Pending }
    }
  })

  return { ...currentState, ...newState }
}
