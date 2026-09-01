// On each Pending, Expired, Fulfilled order action a corresponding sound is dispatched

import { UiOrderType } from '@cowprotocol/types'

import { isAnyOf } from '@reduxjs/toolkit'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'

import { getCowSoundError, getCowSoundReceiptBundle, getCowSoundSend, getCowSoundSuccess } from 'modules/sounds'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { AppState } from '../../index'
import { AddPendingOrderParams, BatchOrdersUpdateParams, FulfillOrdersBatchParams, UpdateOrderParams } from '../actions'
import * as OrderActions from '../actions'
import { getOrderByIdFromState } from '../helpers'
import { OrdersState } from '../reducer'

// action syntactic sugar
// const isSingleOrderChangeAction = isAnyOf(OrderActions.addPendingOrder)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isUpdateOrderAction = isAnyOf(OrderActions.updateOrder)
const isBatchOrderAction = isAnyOf(
  OrderActions.fulfillOrdersBatch,
  OrderActions.expireOrdersBatch,
  OrderActions.cancelOrdersBatch,
  OrderActions.preSignOrders,
)
const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch)
// const isBatchPresignOrders = isAnyOf(OrderActions.preSignOrders)

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export const soundMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isBatchOrderAction(action)) {
    const { chainId } = action.payload
    const orders = store.getState().orders[chainId]

    // no orders were executed/expired
    if (!orders) {
      return result
    }

    const updatedElements = isBatchFulfillOrderAction(action)
      ? action.payload.orders.map(({ uid }) => uid)
      : action.payload.ids
    // no orders were executed/expired
    if (updatedElements.length === 0) {
      return result
    }
  }

  let cowSounds: HTMLAudioElement[] = []
  if (isPendingOrderAction(action)) {
    if (_shouldPlayPendingOrderSound(action.payload)) {
      cowSounds = [getCowSoundSend()]
    }
  } else if (isBatchFulfillOrderAction(action)) {
    cowSounds = _shouldPlayReceiptSound(action.payload.orders) ? getCowSoundReceiptBundle() : [getCowSoundSuccess()]
  } else if (isBatchExpireOrderAction(action)) {
    if (_shouldPlayExpiredOrderSound(action.payload, store)) {
      cowSounds = [getCowSoundError()]
    }
  } else if (isBatchCancelOrderAction(action)) {
    cowSounds = [getCowSoundError()]
  } else if (isUpdateOrderAction(action)) {
    const cowSound = _getUpdatedOrderSound(action.payload)
    cowSounds = cowSound ? [cowSound] : []
  }

  cowSounds.forEach((cowSound) => {
    cowSound.currentTime = 0
    cowSound.play().catch((e) => {
      console.error('🐮 Moooooo sound cannot be played', e)
    })
  })

  return result
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _getUpdatedOrderSound(payload: UpdateOrderParams) {
  if (!payload.order.isHidden) {
    // Trigger COW sound when an order is being updated to a non-hidden state
    return getCowSoundSend()
  }
  return undefined
}

function _shouldPlayExpiredOrderSound(
  payload: BatchOrdersUpdateParams,
  store: MiddlewareAPI<Dispatch<AnyAction>, { orders: OrdersState }>,
): boolean {
  const { chainId, ids } = payload
  const orders = store.getState().orders[chainId]

  // Only play COW sound if there's at least one order expired which wasn't hidden
  return ids.some((id) => {
    const order = getOrderByIdFromState(orders, id)?.order
    return order && !order.isHidden
  })
}

function _shouldPlayPendingOrderSound(payload: AddPendingOrderParams): boolean {
  // Only play COW sound if added pending order is not hidden
  return !payload.order.isHidden
}

function _shouldPlayReceiptSound(orders: FulfillOrdersBatchParams['orders']): boolean {
  return orders.some((order) => getUiOrderType(order) === UiOrderType.SWAP && !getIsBridgeOrder(order))
}
