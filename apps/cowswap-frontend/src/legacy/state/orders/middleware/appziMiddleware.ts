import { getExplorerOrderLink, timeSinceInSeconds } from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { isAnyOf } from '@reduxjs/toolkit'
import { getSurveyType, isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'

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
    // Shows NPS feedback (or attempts to) when there's a successful trade
    const {
      chainId,
      orders: [{ uid }],
    } = action.payload

    _triggerAppzi(store, chainId, uid, { traded: true })
  } else if (isBatchExpireOrderAction(action)) {
    // Shows NPS feedback (or attempts to) when the order expired
    const {
      chainId,
      ids: [id],
    } = action.payload

    _triggerAppzi(store, chainId, id, { expired: true })
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
  _order?: OrderActions.SerializedOrder | undefined
) {
  const order = _order || getOrderByIdFromState(store.getState().orders[chainId], orderId)?.order
  const openSince = order?.openSince
  const explorerUrl = getExplorerOrderLink(chainId, orderId)

  const uiOrderType = order && getUiOrderType(order)

  // TODO: should we show NPS for TWAP orders as well?
  // Open Appzi NPS for limit orders only if they were filled before `PENDING_TOO_LONG_TIME` since creating
  const isLimitOrderRecentlyTraded =
    uiOrderType === UiOrderType.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)

  // Do not show NPS if the order is hidden
  const isHidden = order?.isHidden

  if (isHidden || isLimitOrderRecentlyTraded) {
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
    getSurveyType(uiOrderType)
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getPendingOrderIds(store: MiddlewareAPI<Dispatch<AnyAction>>, chainId: ChainId) {
  return Object.keys(store.getState().orders[chainId]?.pending || {})
}

// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
function getUiOrderTypeFromStore(store: MiddlewareAPI<Dispatch<AnyAction>>, chainId: any, id: any) {
  const orders = store.getState().orders[chainId]
  const order = getOrderByIdFromState(orders, id)?.order
  return order && getUiOrderType(order)
}
