import { isAnyOf } from '@reduxjs/toolkit'
import { Middleware } from 'redux'

import { isTruthy } from 'legacy/utils/misc'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'
import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'
import { batchFulfillOrderPopup } from './batchFulfillOrderPopup'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'
import { pendingOrderPopup } from './pendingOrderPopup'
import { updateOrderPopup } from './updateOrderPopup'

import { AppState } from '../../index'
import * as OrderActions from '../actions'
import { getOrderByIdFromState } from '../helpers'

// action syntactic sugar
// const isSingleOrderChangeAction = isAnyOf(OrderActions.addPendingOrder)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isUpdateOrderAction = isAnyOf(OrderActions.updateOrder)
const isBatchOrderAction = isAnyOf(
  OrderActions.fulfillOrdersBatch,
  OrderActions.expireOrdersBatch,
  OrderActions.cancelOrdersBatch,
  OrderActions.preSignOrders
)
const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)

export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isPendingOrderAction(action)) {
    pendingOrderPopup(store, action.payload)
  } else if (isUpdateOrderAction(action)) {
    updateOrderPopup(store, action.payload)
  } else if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const ordersMap = store.getState().orders[chainId]

    if (!ordersMap) {
      return result
    }

    if (isBatchFulfillOrderAction(action)) {
      // construct Fulfilled Order Popups for each Order
      batchFulfillOrderPopup(store, action.payload, ordersMap)
    } else if (action.type === 'order/cancelOrdersBatch') {
      // Why is this and the next condition are not using a `isAnyOf` like the others?
      // Because these 3 actions (this and the next 2) have the exact same payload structure.
      // Seems like redux is not smart enough to differentiate based on action.type,
      // so we need to do it manually like this

      const orders = action.payload.ids.map((id) => getOrderByIdFromState(ordersMap, id)?.order).filter(isTruthy)

      batchCancelOrdersPopup(store, orders)
    } else if (action.type === 'order/expireOrdersBatch') {
      // construct Expired Order Popups for each Order
      batchExpireOrdersPopup(store, action.payload, ordersMap)
    } else if (action.type === 'order/presignOrders') {
      batchPresignOrdersPopup(store, action.payload, ordersMap)
    }
  }

  return result
}
