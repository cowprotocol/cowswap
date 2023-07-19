import { isAnyOf } from '@reduxjs/toolkit'
import { jotaiStore } from 'jotaiStore'
import { Middleware } from 'redux'

import { isTruthy } from 'legacy/utils/misc'

import { emulatedTwapOrdersMapAtom, setTwapOrderStatusAtom, TwapOrderStatus } from 'modules/twap'

import { batchCancelOrdersPopup } from './batchCancelOrdersPopup'

import { AppState } from '../../index'
import { cancelOrdersBatch } from '../actions'

const isCancelOrdersBatch = isAnyOf(cancelOrdersBatch)

export const composableOrdersPopupMiddleware: Middleware<Record<string, unknown>, AppState> =
  (store) => (next) => (action) => {
    const result = next(action)

    if (isCancelOrdersBatch(action)) {
      // TODO: generalize this to all composable orders, not only twap
      const composableOrders = jotaiStore.get(emulatedTwapOrdersMapAtom)
      const cancelledOrders = action.payload.ids.map((id) => composableOrders[id]).filter(isTruthy)

      batchCancelOrdersPopup(store, cancelledOrders)

      cancelledOrders.forEach((order) => {
        jotaiStore.set(setTwapOrderStatusAtom, order.id, TwapOrderStatus.Cancelled)
      })
    }

    return result
  }
