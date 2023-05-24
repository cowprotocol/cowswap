// on each Pending, Expired, Fulfilled order action
// a corresponding Popup action is dispatched
import { AppState } from '../../index'
import { getOrderByIdFromState, OrderIDWithPopup, OrderTxTypes, setPopupData } from '../helpers'
import { pendingOrderActionMiddleware } from './pendingOrderActionMiddleware'
import { updateOrderActionMiddleware } from './updateOrderActionMiddleware'
import { batchFulfillOrderActionMiddleware } from './batchFulfillOrderActionMiddleware'
import { orderAnalytics } from '../../../components/analytics'
import * as OrderActions from '../actions'
import { addPopup } from '../../application/reducer'
import { Middleware } from 'redux'
import { isAnyOf } from '@reduxjs/toolkit'
import { SerializedOrder } from '../actions'
import { buildCancellationPopupSummary } from '../buildCancellationPopupSummary'

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

  const idsAndPopups: OrderIDWithPopup[] = []
  if (isPendingOrderAction(action)) {
    return pendingOrderActionMiddleware(store, action.payload, result)
  } else if (isUpdateOrderAction(action)) {
    return updateOrderActionMiddleware(store, action.payload, result)
  } else if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) {
      return result
    }

    if (isBatchFulfillOrderAction(action)) {
      // construct Fulfilled Order Popups for each Order
      batchFulfillOrderActionMiddleware(store, action.payload, orders)
    } else if (action.type === 'order/cancelOrdersBatch') {
      // Why is this and the next condition are not using a `isAnyOf` like the others?
      // Because these 3 actions (this and the next 2) have the exact same payload structure.
      // Seems like redux is not smart enough to differentiate based on action.type,
      // so we need to do it manually like this

      // construct Cancelled Order Popups for each Order
      action.payload.ids.forEach((id) => {
        const orderObject = getOrderByIdFromState(orders, id)

        if (orderObject) {
          const { order } = orderObject

          const popup = _buildCancellationPopup(order)
          orderAnalytics('Canceled', order.class)

          idsAndPopups.push({ id, popup })
        }
      })
    } else if (action.type === 'order/expireOrdersBatch') {
      // construct Expired Order Popups for each Order
      action.payload.ids.forEach((id) => {
        const orderObject = getOrderByIdFromState(orders, id)

        // Do not trigger expired pop up if order is hidden
        if (orderObject && !orderObject.order.isHidden) {
          const { summary, class: orderClass } = orderObject.order

          const popup = setPopupData(OrderTxTypes.METATXN, {
            success: false,
            summary,
            id,
            status: OrderActions.OrderStatus.EXPIRED,
          })
          orderAnalytics('Expired', orderClass)

          idsAndPopups.push({ id, popup })
        }
      })
    } else if (action.type === 'order/presignOrders') {
      action.payload.ids.forEach((id) => {
        const orderObject = getOrderByIdFromState(orders, id)

        if (orderObject) {
          const { order } = orderObject

          const popup = setPopupData(OrderTxTypes.METATXN, { summary: order.summary, status: 'presigned', id })
          orderAnalytics('Posted', order.class, 'Pre-Signed')
          idsAndPopups.push({ id, popup })
        }
      })
    }
  }

  // dispatch all necessary Popups
  // empty if for unrelated actions
  idsAndPopups.forEach(({ popup }) => {
    store.dispatch(addPopup(popup))
  })

  return result
}

function _buildCancellationPopup(order: SerializedOrder) {
  const { cancellationHash, apiAdditionalInfo, id, summary } = order

  if (cancellationHash && !apiAdditionalInfo) {
    // EthFlow order which has been cancelled and does not exist on the backend
    // Use the `tx` popup
    return setPopupData(OrderTxTypes.TXN, {
      success: true,
      summary: buildCancellationPopupSummary(id, summary),
      hash: cancellationHash,
      id,
    })
  } else {
    // Regular order being cancelled
    // Use `metatx` popup
    return setPopupData(OrderTxTypes.METATXN, {
      success: true,
      summary: buildCancellationPopupSummary(id, summary),
      id,
    })
  }
}
