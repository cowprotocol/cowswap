import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

import { orderAnalytics } from 'legacy/components/analytics'

import { ExecutedSummary } from 'common/pure/ExecutedSummary'
import { parseOrder } from 'utils/orderUtils/parseOrder'

import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { FulfillOrdersBatchParams, Order } from '../actions'
import * as OrderActions from '../actions'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { OrdersStateNetwork } from '../reducer'

export function batchFulfillOrderPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: FulfillOrdersBatchParams,
  orders: OrdersStateNetwork
) {
  payload.ordersData.forEach(({ id, summary }) => {
    const orderObject = getOrderByIdFromState(orders, id)
    if (orderObject) {
      const { class: orderClass } = orderObject.order
      // it's an OrderTxTypes.TXN, yes, but we still want to point to the explorer
      // because it's nicer there
      const parsedOrder = parseOrder(orderObject.order as Order)
      const summaryComponent = <ExecutedSummary order={parsedOrder} />

      const popup = setPopupData(OrderTxTypes.METATXN, {
        id,
        summary: summaryComponent || summary,
        status: OrderActions.OrderStatus.FULFILLED,
        descriptor: null,
      })
      orderAnalytics('Executed', orderClass)

      store.dispatch(addPopup(popup))
    }
  })
}
