import { Middleware, isAnyOf } from '@reduxjs/toolkit'

import { addPopup } from 'state/application/actions'
import { AppState } from 'state'
import * as OrderActions from './actions'

import { OrderIDWithPopup, OrderTxTypes, PopupPayload, buildCancellationPopupSummary, setPopupData } from './helpers'

// action syntactic sugar
const isSingleOrderChangeAction = isAnyOf(
  OrderActions.addPendingOrder,
  OrderActions.expireOrder,
  OrderActions.fulfillOrder,
  OrderActions.cancelOrder
)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isSingleFulfillOrderAction = isAnyOf(OrderActions.fulfillOrder)
const isBatchOrderAction = isAnyOf(
  OrderActions.fulfillOrdersBatch,
  OrderActions.expireOrdersBatch,
  OrderActions.cancelOrdersBatch
)
const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
// const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch) // disabled because doesn't work on `if`
const isFulfillOrderAction = isAnyOf(OrderActions.addPendingOrder, OrderActions.fulfillOrdersBatch)
const isExpireOrdersAction = isAnyOf(OrderActions.expireOrdersBatch, OrderActions.expireOrder)
const isCancelOrderAction = isAnyOf(OrderActions.cancelOrder, OrderActions.cancelOrdersBatch)

// on each Pending, Expired, Fulfilled order action
// a corresponsing Popup action is dispatched
export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  let idsAndPopups: OrderIDWithPopup[] = []
  //  is it a singular action with {chainId, id} payload
  if (isSingleOrderChangeAction(action)) {
    const { id, chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) return

    const { pending, fulfilled, expired, cancelled } = orders

    const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id] || cancelled?.[id]

    // look up Order.summary for Popup
    const summary = orderObject?.order.summary

    let popup: PopupPayload
    if (isPendingOrderAction(action)) {
      // Pending Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'submitted', id })
    } else if (isSingleFulfillOrderAction(action)) {
      // it's an OrderTxTypes.TXN, yes, but we still want to point to the explorer
      // because it's nicer there
      popup = setPopupData(OrderTxTypes.METATXN, {
        summary,
        id,
        status: OrderActions.OrderStatus.FULFILLED,
        descriptor: 'was traded',
      })
    } else if (isCancelOrderAction(action)) {
      // action is order/cancelOrder
      // Cancelled Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, {
        success: true,
        summary: buildCancellationPopupSummary(id, summary),
        id,
      })
    } else {
      // action is order/expireOrder
      // Expired Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, {
        success: false,
        summary,
        id,
        status: OrderActions.OrderStatus.EXPIRED,
      })
    }

    idsAndPopups.push({
      id,
      popup,
    })
  } else if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) return

    const { pending, fulfilled, expired, cancelled } = orders

    if (isBatchFulfillOrderAction(action)) {
      // construct Fulfilled Order Popups for each Order

      idsAndPopups = action.payload.ordersData.map(({ id, summary }) => {
        // it's an OrderTxTypes.TXN, yes, but we still want to point to the explorer
        // because it's nicer there
        const popup = setPopupData(OrderTxTypes.METATXN, {
          summary,
          id,
          status: OrderActions.OrderStatus.FULFILLED,
          descriptor: 'was traded',
        })

        return { id, popup }
      })
    } else if (action.type === 'order/cancelOrdersBatch') {
      // Why is this condition not using a `isAnyOf` like the others?
      // For a reason that I'm not aware, if I do that the following `else`
      // complains that it'll never be reached.
      // If you know how to fix it, let me know.

      // construct Cancelled Order Popups for each Order
      idsAndPopups = action.payload.ids.map((id) => {
        const orderObject = cancelled?.[id]

        const summary = orderObject?.order.summary

        const popup = setPopupData(OrderTxTypes.METATXN, {
          success: true,
          summary: buildCancellationPopupSummary(id, summary),
          id,
        })

        return { id, popup }
      })
    } else {
      // construct Expired Order Popups for each Order
      idsAndPopups = action.payload.ids.map((id) => {
        const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id]

        const summary = orderObject?.order.summary

        const popup = setPopupData(OrderTxTypes.METATXN, {
          success: false,
          summary,
          id,
          status: OrderActions.OrderStatus.EXPIRED,
        })

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

let moooooSend: HTMLAudioElement
function getCowSoundSend(): HTMLAudioElement {
  if (!moooooSend) {
    moooooSend = new Audio('/audio/mooooo-send__lower-90.mp3')
  }

  return moooooSend
}

let moooooSuccess: HTMLAudioElement
function getCowSoundSuccess(): HTMLAudioElement {
  if (!moooooSuccess) {
    moooooSuccess = new Audio('/audio/mooooo-success__ben__lower-90.mp3')
  }

  return moooooSuccess
}

let moooooError: HTMLAudioElement
function getCowSoundError(): HTMLAudioElement {
  if (!moooooError) {
    moooooError = new Audio('/audio/mooooo-error__lower-90.mp3')
  }

  return moooooError
}

// on each Pending, Expired, Fulfilled order action
// a corresponsing sound is dispatched
export const soundMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isBatchOrderAction(action)) {
    const { chainId } = action.payload
    const orders = store.getState().orders[chainId]

    // no orders were executed/expired
    if (!orders) return result

    const updatedElements = isBatchFulfillOrderAction(action) ? action.payload.ordersData : action.payload.ids
    // no orders were executed/expired
    if (updatedElements.length === 0) return result
  }

  let cowSound
  if (isPendingOrderAction(action)) {
    cowSound = getCowSoundSend()
  } else if (isFulfillOrderAction(action)) {
    cowSound = getCowSoundSuccess()
  } else if (isExpireOrdersAction(action)) {
    cowSound = getCowSoundError()
  } else if (isCancelOrderAction(action)) {
    // TODO: find a unique sound for order cancellation
    cowSound = getCowSoundError()
  }

  cowSound?.play().catch((e) => console.error('🐮 Moooooo sound cannot be played', e))

  return result
}
