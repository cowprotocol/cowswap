import { orderAnalytics } from '@cowprotocol/analytics'

import { Dispatch, MiddlewareAPI } from 'redux'

import { computeOrderSummary } from 'common/updaters/orders/utils'

import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { PresignedOrdersParams } from '../actions'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { OrdersStateNetwork } from '../reducer'
import { deserializeOrder } from '../utils/deserializeOrder'

export function batchPresignOrdersPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: PresignedOrdersParams,
  orders: OrdersStateNetwork
) {
  payload.ids.forEach((id) => {
    const orderObject = getOrderByIdFromState(orders, id)

    if (orderObject) {
      const { order } = orderObject

      const popup = setPopupData(OrderTxTypes.METATXN, {
        summary: computeOrderSummary({
          orderFromStore: deserializeOrder(orderObject),
          orderFromApi: null,
        }),
        status: 'presigned',
        id,
      })
      orderAnalytics('Posted', order.class, 'Pre-Signed')

      store.dispatch(addPopup(popup))
    }
  })
}
