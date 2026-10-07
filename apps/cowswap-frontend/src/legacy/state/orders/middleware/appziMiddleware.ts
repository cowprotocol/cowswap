import { getExplorerOrderLink, timeSinceInSeconds } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { isAnyOf } from '@reduxjs/toolkit'
import { getSurveyType, isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { AppState } from '../../index'
import * as OrderActions from '../actions'
import { getOrderByIdFromState } from '../helpers'

const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)
const isBatchPresignOrderAction = isAnyOf(OrderActions.preSignOrders)
const isPendingOrderAction = isAnyOf(OrderActions.addPendingOrder)
const isBatchCancelOrderAction = isAnyOf(OrderActions.cancelOrdersBatch)

export const appziMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  if (isBatchFulfillOrderAction(action)) {
    triggerFulfilledOrderSurvey(store, action.payload)
  } else if (isBatchExpireOrderAction(action)) {
    const { chainId, ids } = action.payload
    const id = ids.find((id) => getUiOrderTypeFromStore(store, chainId, id) !== UiOrderType.TWAP)

    if (id) _triggerAppzi(store, chainId, id, { expired: true })
  } else if (isBatchPresignOrderAction(action)) {
    // For SC wallet orders, shows NPS feedback (or attempts to) only when the order was pre-signed
    const {
      chainId,
      ids: [id],
    } = action.payload

    const uiOrderType = getUiOrderTypeFromStore(store, chainId, id)

    // Only for limit orders
    if (uiOrderType === UiOrderType.LIMIT) {
      _triggerAppzi(store, chainId, id, { created: true })
    }
  } else if (isPendingOrderAction(action)) {
    // For EOA orders, shows NPS feedback (or attempts to) when the order is placed
    const { chainId, order } = action.payload

    // The whole order obj is part of the payload, use it directly
    const uiOrderType = getUiOrderType(order)

    // Only for limit orders
    if (uiOrderType === UiOrderType.LIMIT) {
      _triggerAppzi(store, chainId, order.id, { created: true }, order)
    }
  } else if (isBatchCancelOrderAction(action)) {
    const {
      chainId,
      ids: [id],
    } = action.payload

    const uiOrderType = getUiOrderTypeFromStore(store, chainId, id)

    // Only for limit orders
    if (uiOrderType === UiOrderType.LIMIT) {
      _triggerAppzi(store, chainId, id, { cancelled: true })
    }
  }

  return next(action)
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
function _triggerAppzi(
  store: MiddlewareAPI<Dispatch<AnyAction>>,
  chainId: ChainId,
  orderId: string,
  npsParams: Parameters<typeof triggerAppziSurvey>[0],
  _order?: OrderActions.SerializedOrder | undefined,
) {
  const order = _order || getOrderByIdFromState(store.getState().orders[chainId], orderId)?.order
  const openSince = order?.openSince
  const explorerUrl = getExplorerOrderLink(chainId, orderId)

  const uiOrderType = order && getUiOrderType(order)

  const isLimitOrderRecentlyTraded =
    uiOrderType === UiOrderType.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)

  const isHidden = order?.isHidden

  if (isHidden || isLimitOrderRecentlyTraded || uiOrderType === UiOrderType.TWAP) {
    return
  }

  triggerAppziSurvey(
    {
      ...npsParams,
      secondsSinceOpen: timeSinceInSeconds(openSince),
      explorerUrl,
      chainId,
      orderType: uiOrderType,
      account: order?.owner,
      pendingOrderIds: getPendingOrderIds(store, chainId).join(','),
    },
    getSurveyType(uiOrderType),
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getPendingOrderIds(store: MiddlewareAPI<Dispatch<AnyAction>>, chainId: ChainId) {
  return Object.keys(store.getState().orders[chainId]?.pending || {})
}

function getUiOrderTypeFromStore(
  store: MiddlewareAPI<Dispatch<AnyAction>>,
  chainId: ChainId,
  id: string,
): UiOrderType | undefined {
  const orders = store.getState().orders[chainId]
  const order = getOrderByIdFromState(orders, id)?.order
  return order && getUiOrderType(order)
}

function triggerFulfilledOrderSurvey(
  store: MiddlewareAPI<Dispatch<AnyAction>>,
  { chainId, orders }: OrderActions.FulfillOrdersBatchParams,
): void {
  const firstOrder = orders.find(
    (order) => !getIsBridgeOrder(order) && getUiOrderTypeFromStore(store, chainId, order.uid) !== UiOrderType.TWAP,
  )

  if (firstOrder && !getIsBridgeOrder(firstOrder)) {
    _triggerAppzi(store, chainId, firstOrder.uid, { traded: true })
  }
}
