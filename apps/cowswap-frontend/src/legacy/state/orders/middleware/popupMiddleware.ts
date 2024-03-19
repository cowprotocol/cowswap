import { isAnyOf } from '@reduxjs/toolkit'
import { Middleware } from 'redux'

import { batchPresignOrdersPopup } from './batchPresignOrdersPopup'

import { AppState } from '../../index'
import * as OrderActions from '../actions'

// action syntactic sugar
// const isSingleOrderChangeAction = isAnyOf(OrderActions.addPendingOrder)
const isBatchOrderAction = isAnyOf(OrderActions.expireOrdersBatch, OrderActions.preSignOrders)

export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const ordersMap = store.getState().orders[chainId]

    if (!ordersMap) {
      return result
    }

    if (action.type === 'order/presignOrders') {
      batchPresignOrdersPopup(store, action.payload, ordersMap)
    }
  }

  return result
}
