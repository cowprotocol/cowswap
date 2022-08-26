import { Middleware, isAnyOf, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit'

import { addPopup } from 'state/application/reducer'
import { AppState } from 'state'
import * as OrderActions from './actions'

import { SupportedChainId as ChainId } from 'constants/chains'

import { OrderIDWithPopup, OrderTxTypes, PopupPayload, buildCancellationPopupSummary, setPopupData } from './helpers'
import { registerOnWindow } from 'utils/misc'
import { getCowSoundError, getCowSoundSend, getCowSoundSuccess } from 'utils/sound'
// import ReactGA from 'react-ga4'
import { orderAnalytics } from 'utils/analytics'
import { openNpsAppziSometimes } from 'utils/appzi'
import { OrderObject, OrdersStateNetwork } from 'state/orders/reducer'
import { timeSinceInSeconds } from 'utils/time'
import { getExplorerOrderLink } from 'utils/explorer'

// action syntactic sugar
const isSingleOrderChangeAction = isAnyOf(
  OrderActions.addPendingOrder,
  OrderActions.expireOrder,
  OrderActions.fulfillOrder,
  OrderActions.cancelOrder
)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isPresignOrders = isAnyOf(OrderActions.preSignOrders)
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
const isSingleExpireOrderAction = isAnyOf(OrderActions.expireOrder)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isCancelOrderAction = isAnyOf(OrderActions.cancelOrder, OrderActions.cancelOrdersBatch)

// on each Pending, Expired, Fulfilled order action
// a corresponding Popup action is dispatched
export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  let idsAndPopups: OrderIDWithPopup[] = []
  //  is it a singular action with {chainId, id} payload
  if (isSingleOrderChangeAction(action)) {
    const { id, chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]
    const orderObject = _getOrderById(orders, id)

    if (!orderObject) {
      return result
    }
    // look up Order.summary for Popup
    const summary = orderObject.order.summary

    let popup: PopupPayload
    if (isPendingOrderAction(action)) {
      // Pending Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'submitted', id })
      orderAnalytics('Posted', 'Offchain')
    } else if (isPresignOrders(action)) {
      popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'presigned', id })
      orderAnalytics('Posted', 'Pre-Signed')
    } else if (isSingleFulfillOrderAction(action)) {
      // it's an OrderTxTypes.TXN, yes, but we still want to point to the explorer
      // because it's nicer there
      popup = setPopupData(OrderTxTypes.METATXN, {
        summary,
        id,
        status: OrderActions.OrderStatus.FULFILLED,
        descriptor: 'was traded',
      })
      orderAnalytics('Executed')
    } else if (isCancelOrderAction(action)) {
      // action is order/cancelOrder
      // Cancelled Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, {
        success: true,
        summary: buildCancellationPopupSummary(id, summary),
        id,
      })
      orderAnalytics('Canceled')
    } else {
      // action is order/expireOrder
      // Expired Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, {
        success: false,
        summary,
        id,
        status: OrderActions.OrderStatus.EXPIRED,
      })
      orderAnalytics('Expired')
    }

    idsAndPopups.push({
      id,
      popup,
    })
  } else if (isBatchOrderAction(action)) {
    const { chainId } = action.payload

    // use current state to lookup orders' data
    const orders = store.getState().orders[chainId]

    if (!orders) {
      return result
    }

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
        orderAnalytics('Executed')

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
        orderAnalytics('Canceled')

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
        orderAnalytics('Expired')

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

function removeLightningEffect() {
  document.body.classList.remove('lightning')
}

function addLightningEffect() {
  document.body.classList.add('lightning')

  setTimeout(() => {
    removeLightningEffect()
  }, 3000)
}
registerOnWindow({ addLightningEffect })

// On each Pending, Expired, Fulfilled order action a corresponding sound is dispatched
export const soundMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isBatchOrderAction(action)) {
    const { chainId } = action.payload
    const orders = store.getState().orders[chainId]

    // no orders were executed/expired
    if (!orders) {
      return result
    }

    const updatedElements = isBatchFulfillOrderAction(action) ? action.payload.ordersData : action.payload.ids
    // no orders were executed/expired
    if (updatedElements.length === 0) {
      return result
    }
  }

  let cowSound
  if (isPendingOrderAction(action)) {
    cowSound = getCowSoundSend()
  } else if (isFulfillOrderAction(action)) {
    cowSound = getCowSoundSuccess()
  } else if (isExpireOrdersAction(action)) {
    cowSound = getCowSoundError()
  } else if (isCancelOrderAction(action)) {
    cowSound = getCowSoundError()
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 Moooooo sound cannot be played', e)
    })
  }

  return result
}

export const appziMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  if (isBatchFulfillOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when there's a successful trade
    const {
      chainId,
      ordersData: [{ id }],
    } = action.payload

    _triggerNps(store, chainId, id, { traded: true })
  } else if (isSingleFulfillOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when there's a successful trade
    const { chainId, id } = action.payload

    _triggerNps(store, chainId, id, { traded: true })
  } else if (isBatchExpireOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when the order expired
    const {
      chainId,
      ids: [id],
    } = action.payload

    _triggerNps(store, chainId, id, { expired: true })
  } else if (isSingleExpireOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when the order expired
    const { chainId, id } = action.payload

    _triggerNps(store, chainId, id, { expired: true })
  }

  return next(action)
}

function _triggerNps(
  store: MiddlewareAPI<Dispatch<AnyAction>>,
  chainId: ChainId,
  orderId: string,
  npsParams: Parameters<typeof openNpsAppziSometimes>[0]
) {
  const orders = store.getState().orders[chainId]
  const openSince = _getOrderById(orders, orderId)?.order?.openSince
  const explorerUrl = getExplorerOrderLink(chainId, orderId)

  openNpsAppziSometimes({ ...npsParams, secondsSinceOpen: timeSinceInSeconds(openSince), explorerUrl, chainId })
}

function _getOrderById(orders: OrdersStateNetwork | undefined, id: string): OrderObject | undefined {
  if (!orders) {
    return
  }

  const { pending, presignaturePending, fulfilled, expired, cancelled } = orders

  return pending?.[id] || presignaturePending?.[id] || fulfilled?.[id] || expired?.[id] || cancelled?.[id]
}
