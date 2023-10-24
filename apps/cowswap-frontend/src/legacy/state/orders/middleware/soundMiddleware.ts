// On each Pending, Expired, Fulfilled order action a corresponding sound is dispatched
import { getCowSoundError, getCowSoundSend, getCowSoundSuccess, isMobile } from '@cowprotocol/common-utils'

import { isAnyOf } from '@reduxjs/toolkit'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'

import { HALLOWEEN_MODE } from 'common/constants/theme'

import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { AddPendingOrderParams, BatchOrdersUpdateParams, UpdateOrderParams } from '../actions'
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
  OrderActions.preSignOrders
)
const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch)
// const isBatchPresignOrders = isAnyOf(OrderActions.preSignOrders)
const isFulfillOrderAction = isAnyOf(OrderActions.addPendingOrder, OrderActions.fulfillOrdersBatch)
const isAddPopup = isAnyOf(addPopup)

function removeLightningEffect() {
  document.body.classList.remove('lightning')
}
function addLightningEffect() {
  document.body.classList.add('lightning')
  setTimeout(() => {
    removeLightningEffect()
  }, 3000)
}

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

  const { userDarkMode, matchesDarkMode } = store.getState().user
  const isDarkMode = userDarkMode === null ? matchesDarkMode : userDarkMode

  let cowSound
  let showLighningEffect = false
  const isHalloweenMode = HALLOWEEN_MODE && isDarkMode
  const isHalloweenModeDesktop = HALLOWEEN_MODE && isDarkMode && !isMobile
  if (isPendingOrderAction(action)) {
    if (_shouldPlayPendingOrderSound(action.payload)) {
      cowSound = getCowSoundSend(isHalloweenMode)
      showLighningEffect = isHalloweenModeDesktop
    }
  } else if (isFulfillOrderAction(action)) {
    cowSound = getCowSoundSuccess(isHalloweenMode)
    showLighningEffect = isHalloweenModeDesktop
  } else if (isBatchExpireOrderAction(action)) {
    if (_shouldPlayExpiredOrderSound(action.payload, store)) {
      cowSound = getCowSoundError(isHalloweenMode)
    }
  } else if (isBatchCancelOrderAction(action)) {
    cowSound = getCowSoundError(isHalloweenMode)
  } else if (isFailedTxAction(action)) {
    cowSound = getCowSoundError(isHalloweenMode)
  } else if (isUpdateOrderAction(action)) {
    cowSound = _getUpdatedOrderSound(action.payload, isHalloweenMode)
  }

  if (cowSound) {
    if (showLighningEffect) {
      setTimeout(addLightningEffect, 300)
    }
    cowSound.play().catch((e) => {
      removeLightningEffect()
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

function _getUpdatedOrderSound(payload: UpdateOrderParams, isHalloweenMode: boolean) {
  if (!payload.order.isHidden) {
    // Trigger COW sound when an order is being updated to a non-hidden state
    return getCowSoundSend(isHalloweenMode)
  }
  return undefined
}

/**
 * Checks whether the action is `addPopup` for a `txn` which failed
 */
function isFailedTxAction(action: unknown): boolean {
  return isAddPopup(action) && 'txn' in action.payload.content && action.payload.content.txn.success === false
}
