import { Middleware, isAnyOf } from '@reduxjs/toolkit'

import * as OrderActions from './actions'
import { OrderID } from 'utils/operator'
import { addPopup } from 'state/application/actions'
import { AppState } from 'state'

const isSingleOrderChangeAction = isAnyOf(
  OrderActions.addPendingOrder,
  OrderActions.expireOrder,
  OrderActions.fulfillOrder
)

const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)

const isFulfillOrderAction = isAnyOf(OrderActions.fulfillOrder)

const isBatchOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch, OrderActions.expireOrdersBatch)

const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)

// what is passed to addPopup action
type PopupPayload = Parameters<typeof addPopup>[0]
interface OrderIDWithPopup {
  id: OrderID
  popup: PopupPayload
}

// on each Pending, Expired, Fulfilled order action
// a corresponsing Popup action is dispatched
export const popupMiddleware: Middleware<{}, AppState> = store => next => action => {
  const result = next(action)

  let idsAndPopups: OrderIDWithPopup[] = []
  //  is it a singular action with {chainId, id} payload
  if (isSingleOrderChangeAction(action)) {
    const { id, chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) return

    const { pending, fulfilled, expired } = orders

    const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id]

    // look up Order.summary for Popup
    const summary = orderObject?.order.summary

    let popup: PopupPayload

    if (isPendingOrderAction(action)) {
      const key = id + '_pending'
      const content = {
        metatxn: {
          id,
          success: true,
          summary: summary + ' submitted' || `Order ${id} submitted`
        }
      }
      // Pending Order Popup
      popup = { key, content }
    } else if (isFulfillOrderAction(action)) {
      const { transactionHash } = action.payload

      const key = id + '_fulfilled'
      const content = {
        txn: {
          hash: transactionHash,
          success: true,
          summary: summary + ' fulfilled' || `Order ${id} was traded`
        }
      }
      // Fulfilled Order Popup
      popup = { key, content }
    } else {
      // action is order/expireOrder
      const key = id + '_expired'
      const content = {
        metatxn: {
          id: id,
          success: false,
          summary: summary + ' expired' || `Order ${id} expired`
        }
      }
      // Expired Order Popup
      popup = { key, content }
    }

    idsAndPopups.push({
      id,
      popup
    })
  } else if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) return

    const { pending, fulfilled, expired } = orders

    if (isBatchFulfillOrderAction(action)) {
      // construct Fulfilled Order Popups for each Order
      idsAndPopups = action.payload.ordersData.map(({ id, transactionHash }) => {
        const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id]

        const summary = orderObject?.order.summary
        const key = id + '_fulfilled'
        const content = {
          txn: {
            hash: transactionHash,
            success: true,
            summary: summary + ' fulfilled' || `Order ${id} was traded`
          }
        }

        const popup = { key, content }

        return { id, popup }
      })
    } else {
      // construct Expired Order Popups for each Order
      idsAndPopups = action.payload.ids.map(id => {
        const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id]

        const summary = orderObject?.order.summary
        const key = id + '_expired'
        const content = {
          metatxn: {
            id: id,
            success: false,
            summary: summary + ' expired' || `Order ${id} expired`
          }
        }

        const popup = { key, content }

        return { id, popup }
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
