import { isTruthy } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'

import { isAnyOf } from '@reduxjs/toolkit'
import { Middleware } from 'redux'

import { AppState } from 'legacy/state'
import { cancelOrdersBatch } from 'legacy/state/orders/actions'
import { batchCancelOrdersPopup } from 'legacy/state/orders/middleware/batchCancelOrdersPopup'

import { setTwapOrderStatusAtom, twapOrdersAtom } from './twapOrdersListAtom'

import { tokensByAddressAtom } from '../../tokensList/state/tokensListAtom'
import { TwapOrderStatus } from '../types'
import { mapTwapOrderToStoreOrder } from '../utils/mapTwapOrderToStoreOrder'

const isCancelOrdersBatch = isAnyOf(cancelOrdersBatch)

export const composableOrdersPopupMiddleware: Middleware<Record<string, unknown>, AppState> =
  (store) => (next) => (action) => {
    const result = next(action)

    if (isCancelOrdersBatch(action)) {
      // TODO: generalize this to all composable orders, not only twap
      const composableOrders = jotaiStore.get(twapOrdersAtom)
      const tokensByAddress = jotaiStore.get(tokensByAddressAtom)

      // Select TWAP orders by ids
      const cancelledOrdersItems = action.payload.ids.map((id) => composableOrders[id]).filter(isTruthy)
      // Map TWAP orders to store orders
      const cancelledOrders = cancelledOrdersItems.map((order) => mapTwapOrderToStoreOrder(order, tokensByAddress))

      batchCancelOrdersPopup(store, cancelledOrders)

      cancelledOrders.forEach((order) => {
        jotaiStore.set(setTwapOrderStatusAtom, order.id, TwapOrderStatus.Cancelled)
      })
    }

    return result
  }
