import { Dispatch, MiddlewareAPI } from 'redux'
import { AppState } from '../../index'
import { PresignedOrdersParams } from '../actions'
import { OrdersStateNetwork } from '../reducer'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { orderAnalytics } from '../../../components/analytics'
import { addPopup } from '../../application/reducer'

export function batchPresignOrdersPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: PresignedOrdersParams,
  orders: OrdersStateNetwork
) {
  payload.ids.forEach((id) => {
    const orderObject = getOrderByIdFromState(orders, id)

    if (orderObject) {
      const { order } = orderObject

      const popup = setPopupData(OrderTxTypes.METATXN, { summary: order.summary, status: 'presigned', id })
      orderAnalytics('Posted', order.class, 'Pre-Signed')

      store.dispatch(addPopup(popup))
    }
  })
}
