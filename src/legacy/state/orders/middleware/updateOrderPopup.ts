import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

import { orderAnalytics } from '../../../components/analytics'
import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { UpdateOrderParams } from '../actions'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'

export function updateOrderPopup(store: MiddlewareAPI<Dispatch, AppState>, payload: UpdateOrderParams) {
  const { chainId, order } = payload

  // use current state to lookup orders' data
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, order.id)

  // This was a presign order created hidden
  // Trigger the popup if order is no longer hidden
  if (!order.isHidden && orderObject) {
    const popup = setPopupData(OrderTxTypes.METATXN, {
      summary: orderObject.order.summary,
      status: 'submitted',
      id: order.id,
    })
    orderAnalytics('Posted', orderObject.order.class, 'Presign')

    store.dispatch(addPopup(popup))
  }
}
