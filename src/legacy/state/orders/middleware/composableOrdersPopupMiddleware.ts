import { isAnyOf } from '@reduxjs/toolkit'
import { jotaiStore } from 'jotaiStore'
import { Middleware } from 'redux'

import { isTruthy } from 'legacy/utils/misc'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'
import { setTwapOrderStatusAtom, twapOrdersAtom } from 'modules/twap/state/twapOrdersListAtom'
import { TwapOrderStatus } from 'modules/twap/types'
import { mapTwapOrderToStoreOrder } from 'modules/twap/utils/mapTwapOrderToStoreOrder'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'

import { AppState } from '../../index'
import { cancelOrdersBatch } from '../actions'

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
