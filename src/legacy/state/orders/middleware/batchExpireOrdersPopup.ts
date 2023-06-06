import { Dispatch, MiddlewareAPI } from 'redux'

import { orderAnalytics } from '../../../components/analytics'
import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { ExpireOrdersBatchParams } from '../actions'
import * as OrderActions from '../actions'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { OrdersStateNetwork } from '../reducer'

export function batchExpireOrdersPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: ExpireOrdersBatchParams,
  orders: OrdersStateNetwork
) {
  payload.ids.forEach((id) => {
    const orderObject = getOrderByIdFromState(orders, id)

    // Do not trigger expired pop up if order is hidden
    if (orderObject && !orderObject.order.isHidden) {
      const { summary, class: orderClass } = orderObject.order

      const popup = setPopupData(OrderTxTypes.METATXN, {
        success: false,
        summary,
        id,
        status: OrderActions.OrderStatus.EXPIRED,
      })
      orderAnalytics('Expired', orderClass)

      store.dispatch(addPopup(popup))
    }
  })
}
