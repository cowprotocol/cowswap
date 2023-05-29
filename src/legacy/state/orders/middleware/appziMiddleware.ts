import { OrderClass, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { AppState } from '../../index'
import { isOrderInPendingTooLong, openNpsAppziSometimes } from '../../../utils/appzi'
import { getOrderByIdFromState } from '../helpers'
import { getExplorerOrderLink } from '../../../utils/explorer'
import { timeSinceInSeconds } from '../../../../utils/time'
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux'
import * as OrderActions from '../actions'
import { isAnyOf } from '@reduxjs/toolkit'

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

  // Open Appzi NPS for limit orders only if they were filled before `PENDING_TOO_LONG_TIME` since creating
  if (order?.class === OrderClass.LIMIT && npsParams?.traded && isOrderInPendingTooLong(openSince)) {
    return
  }

  openNpsAppziSometimes({ ...npsParams, secondsSinceOpen: timeSinceInSeconds(openSince), explorerUrl, chainId })
}
