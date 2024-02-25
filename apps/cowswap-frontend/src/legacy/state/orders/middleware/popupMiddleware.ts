import { isTruthy } from '@cowprotocol/common-utils'

import { isAnyOf } from '@reduxjs/toolkit'
import { Middleware } from 'redux'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'
import { batchExpireOrdersPopup } from './batchExpireOrdersPopup'
import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'

import { AppState } from '../../index'
import * as OrderActions from '../actions'
import { getOrderByIdFromState } from '../helpers'

// action syntactic sugar
// const isSingleOrderChangeAction = isAnyOf(OrderActions.addPendingOrder)
const isBatchOrderAction = isAnyOf(
  OrderActions.expireOrdersBatch,
  OrderActions.cancelOrdersBatch,
  OrderActions.preSignOrders
)

export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const ordersMap = store.getState().orders[chainId]

    if (!ordersMap) {
      return result
    }

    if (action.type === 'order/cancelOrdersBatch') {
      // Why is this and the next condition are not using a `isAnyOf` like the others?
      // Because these 3 actions (this and the next 2) have the exact same payload structure.
      // Seems like redux is not smart enough to differentiate based on action.type,
      // so we need to do it manually like this

      const orders = action.payload.ids.map((id) => getOrderByIdFromState(ordersMap, id)).filter(isTruthy)

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
