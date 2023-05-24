import { AnyAction, Dispatch, isAnyOf, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'

import { addPopup } from 'legacy/state/application/reducer'
import { AppState } from 'legacy/state'
import * as OrderActions from './actions'
import { AddPendingOrderParams, BatchOrdersUpdateParams, SerializedOrder, UpdateOrderParams } from './actions'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { getOrderByIdFromState, OrderIDWithPopup, OrderTxTypes, setPopupData } from './helpers'
import { registerOnWindow } from 'legacy/utils/misc'
import { getCowSoundError, getCowSoundSend, getCowSoundSuccess } from 'legacy/utils/sound'
import { orderAnalytics } from 'legacy/components/analytics'
import { isOrderInPendingTooLong, openNpsAppziSometimes } from 'legacy/utils/appzi'
import { OrdersState } from 'legacy/state/orders/reducer'
import { timeSinceInSeconds } from 'utils/time'
import { getExplorerOrderLink } from 'legacy/utils/explorer'
import { pendingOrderActionMiddleware } from './middlewares/pendingOrderActionMiddleware'
import { updateOrderActionMiddleware } from './middlewares/updateOrderActionMiddleware'
import { batchFulfillOrderActionMiddleware } from './middlewares/batchFulfillOrderActionMiddleware'
import { buildCancellationPopupSummary } from './buildCancellationPopupSummary'

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
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch)
// const isBatchPresignOrders = isAnyOf(OrderActions.preSignOrders)
const isFulfillOrderAction = isAnyOf(OrderActions.addPendingOrder, OrderActions.fulfillOrdersBatch)

// on each Pending, Expired, Fulfilled order action
// a corresponding Popup action is dispatched
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
    if (_shouldPlayPendingOrderSound(action.payload)) {
      cowSound = getCowSoundSend()
    }
  } else if (isFulfillOrderAction(action)) {
    cowSound = getCowSoundSuccess()
  } else if (isBatchExpireOrderAction(action)) {
    if (_shouldPlayExpiredOrderSound(action.payload, store)) {
      cowSound = getCowSoundError()
    }
  } else if (isBatchCancelOrderAction(action)) {
    cowSound = getCowSoundError()
  } else if (isFailedTxAction(action)) {
    cowSound = getCowSoundError()
  } else if (isUpdateOrderAction(action)) {
    cowSound = _getUpdatedOrderSound(action.payload)
  }

  if (cowSound) {
    cowSound.play().catch((e) => {
      console.error('🐮 Moooooo sound cannot be played', e)
    })
  }

  return result
}

function _shouldPlayPendingOrderSound(payload: AddPendingOrderParams): boolean {
  // Only play COW sound if added pending order is not hidden
  return !payload.order.isHidden
}

function _shouldPlayExpiredOrderSound(
  payload: BatchOrdersUpdateParams,
  store: MiddlewareAPI<Dispatch<AnyAction>, { orders: OrdersState }>
): boolean {
  const { chainId, ids } = payload
  const orders = store.getState().orders[chainId]

  // Only play COW sound if there's at least one order expired which wasn't hidden
  return ids.some((id) => {
    const order = getOrderByIdFromState(orders, id)?.order
    return order && !order.isHidden
  })
}

function _getUpdatedOrderSound(payload: UpdateOrderParams) {
  if (!payload.order.isHidden) {
    // Trigger COW sound when an order is being updated to a non-hidden state
    return getCowSoundSend()
  }
  return undefined
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
  const order = getOrderByIdFromState(orders, orderId)?.order
  const openSince = order?.openSince
  const explorerUrl = getExplorerOrderLink(chainId, orderId)

  // Open Appzi NPS for limit orders only if they were filled before `PENDING_TOO_LONG_TIME` since creating
  if (order?.class === OrderClass.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)) {
    return
  }

  openNpsAppziSometimes({ ...npsParams, secondsSinceOpen: timeSinceInSeconds(openSince), explorerUrl, chainId })
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
