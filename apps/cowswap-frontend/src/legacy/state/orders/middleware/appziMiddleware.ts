import {
  getExplorerOrderLink,
  isOrderInPendingTooLong,
  openNpsAppziSometimes,
  timeSinceInSeconds,
} from '@cowprotocol/common-utils'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { isAnyOf } from '@reduxjs/toolkit'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'

import { getUiOrderType, UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { AppState } from '../../index'
import * as OrderActions from '../actions'
import { getOrderByIdFromState } from '../helpers'

const isBatchFulfillOrderAction = isAnyOf(OrderActions.fulfillOrdersBatch)
const isBatchExpireOrderAction = isAnyOf(OrderActions.expireOrdersBatch)

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

  const uiOrderType = order && getUiOrderType(order)

  // TODO: should we show NPS for TWAP orders as well?
  // Open Appzi NPS for limit orders only if they were filled before `PENDING_TOO_LONG_TIME` since creating
  const isLimitOrderRecentlyTraded =
    uiOrderType === UiOrderType.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)

  // Do not show NPS if the order is hidden and expired
  const isHiddenAndExpired = order?.isHidden && npsParams?.expired

  if (isHiddenAndExpired || isLimitOrderRecentlyTraded) {
    return
  }

  openNpsAppziSometimes({ ...npsParams, secondsSinceOpen: timeSinceInSeconds(openSince), explorerUrl, chainId })
}
