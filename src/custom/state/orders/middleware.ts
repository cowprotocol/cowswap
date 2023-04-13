import { AnyAction, Dispatch, isAnyOf, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'

import { addPopup } from 'state/application/reducer'
import { AppState } from 'state'
import * as OrderActions from './actions'
import { SerializedOrder } from './actions'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { buildCancellationPopupSummary, OrderIDWithPopup, OrderTxTypes, PopupPayload, setPopupData } from './helpers'
import { registerOnWindow } from 'utils/misc'
import { getCowSoundError, getCowSoundSend, getCowSoundSuccess } from 'utils/sound'
// import ReactGA from 'react-ga4'
import { orderAnalytics } from 'components/analytics'
import { isOrderInPendingTooLong, openNpsAppziSometimes } from 'utils/appzi'
import { OrderObject, OrdersStateNetwork } from 'state/orders/reducer'
import { timeSinceInSeconds } from '@cow/utils/time'
import { getExplorerOrderLink } from 'utils/explorer'
import { getExecutedSummary } from '@cow/common/pure/ExecutedSummary'
import { parseOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { Order } from 'state/orders/actions'

// action syntactic sugar
const isSingleOrderChangeAction = isAnyOf(OrderActions.addPendingOrder)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isPresignOrders = isAnyOf(OrderActions.preSignOrders)
const isBatchOrderAction = isAnyOf(
  OrderActions.fulfillOrdersBatch,
  OrderActions.expireOrdersBatch,
  OrderActions.cancelOrdersBatch
)
const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
// const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch) // disabled because doesn't work on `if`
const isFulfillOrderAction = isAnyOf(OrderActions.addPendingOrder, OrderActions.fulfillOrdersBatch)
const isExpireOrdersAction = isAnyOf(OrderActions.expireOrdersBatch)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch)

// on each Pending, Expired, Fulfilled order action
// a corresponding Popup action is dispatched
export const popupMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  const idsAndPopups: OrderIDWithPopup[] = []
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
    const { summary, class: orderClass } = orderObject.order

    let popup: PopupPayload
    if (isPendingOrderAction(action)) {
      const hash = orderObject.order.orderCreationHash
      if (hash) {
        // EthFlow Order
        popup = setPopupData(OrderTxTypes.TXN, {
          summary,
          status: 'submitted',
          id: hash,
          hash,
        })
        orderAnalytics('Posted', orderClass, 'EthFlow')
      } else {
        // Pending Order Popup
        popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'submitted', id })
        orderAnalytics('Posted', orderClass, 'Offchain')
      }
    } else if (isPresignOrders(action)) {
      popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'presigned', id })
      orderAnalytics('Posted', orderClass, 'Pre-Signed')
    } else if (isCancelOrderAction(action)) {
      // action is order/cancelOrder
      // Cancelled Order Popup
      popup = _buildCancellationPopup(orderObject.order)
      orderAnalytics('Canceled', orderClass)
    } else {
      // action is order/expireOrder
      // Expired Order Popup
      popup = setPopupData(OrderTxTypes.METATXN, {
        success: false,
        summary,
        id,
        status: OrderActions.OrderStatus.EXPIRED,
      })
      orderAnalytics('Expired', orderClass)
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

    const { pending, fulfilled, expired, cancelled, creating } = orders

    if (isBatchFulfillOrderAction(action)) {
      // construct Fulfilled Order Popups for each Order

      action.payload.ordersData.forEach(({ id, summary }) => {
        const orderObject = _getOrderById(orders, id)
        if (orderObject) {
          const { class: orderClass } = orderObject.order
          // it's an OrderTxTypes.TXN, yes, but we still want to point to the explorer
          // because it's nicer there
          const parsedOrder = parseOrder(orderObject.order as Order)

          const popup = setPopupData(OrderTxTypes.METATXN, {
            id,
            summary: getExecutedSummary(parsedOrder) || summary,
            status: OrderActions.OrderStatus.FULFILLED,
            descriptor: null,
          })
          orderAnalytics('Executed', orderClass)

          idsAndPopups.push({ id, popup })
        }
      })
    } else if (action.type === 'order/cancelOrdersBatch') {
      // Why is this condition not using a `isAnyOf` like the others?
      // For a reason that I'm not aware, if I do that the following `else`
      // complains that it'll never be reached.
      // If you know how to fix it, let me know.

      // construct Cancelled Order Popups for each Order
      action.payload.ids.forEach((id) => {
        const orderObject = cancelled?.[id]

        if (orderObject) {
          const { order } = orderObject

          const popup = _buildCancellationPopup(order)
          orderAnalytics('Canceled', order.class)

          idsAndPopups.push({ id, popup })
        }
      })
    } else {
      // construct Expired Order Popups for each Order
      action.payload.ids.forEach((id) => {
        const orderObject = pending?.[id] || fulfilled?.[id] || expired?.[id] || creating?.[id]
        if (orderObject) {
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
  } else if (isFailedTxAction(action)) {
    cowSound = getCowSoundError()
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 Moooooo sound cannot be played', e)
    })
  }

  return result
}

const isAddPopup = isAnyOf(addPopup)

/**
 * Checks whether the action is `addPopup` for a `txn` which failed
 */
function isFailedTxAction(action: unknown): boolean {
  return isAddPopup(action) && action.payload?.content?.txn?.success === false
}

export const appziMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  if (isBatchFulfillOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when there's a successful trade
    const {
      chainId,
      ordersData: [{ id }],
    } = action.payload

    _triggerNps(store, chainId, id, { traded: true })
  } else if (isBatchExpireOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when the order expired
    const {
      chainId,
      ids: [id],
    } = action.payload

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
  const order = _getOrderById(orders, orderId)?.order
  const openSince = order?.openSince
  const explorerUrl = getExplorerOrderLink(chainId, orderId)

  // Open Appzi NPS for limit orders only if they were filled before `PENDING_TOO_LONG_TIME` since creating
  if (order?.class === OrderClass.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)) {
    return
  }

  openNpsAppziSometimes({ ...npsParams, secondsSinceOpen: timeSinceInSeconds(openSince), explorerUrl, chainId })
}

function _getOrderById(orders: OrdersStateNetwork | undefined, id: string): OrderObject | undefined {
  if (!orders) {
    return
  }

  const { pending, presignaturePending, fulfilled, expired, cancelled, creating, failed } = orders

  return (
    pending?.[id] ||
    presignaturePending?.[id] ||
    fulfilled?.[id] ||
    expired?.[id] ||
    cancelled?.[id] ||
    creating?.[id] ||
    failed?.[id]
  )
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
