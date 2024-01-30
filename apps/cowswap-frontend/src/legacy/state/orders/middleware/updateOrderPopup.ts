import { orderAnalytics } from '@cowprotocol/analytics'

import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

import { pendingOrderPopup } from './pendingOrderPopup'

import { AppState } from '../../index'
import { UpdateOrderParams } from '../actions'
import { getOrderByIdFromState } from '../helpers'

export function updateOrderPopup(store: MiddlewareAPI<Dispatch, AppState>, payload: UpdateOrderParams) {
  const { order, chainId } = payload
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, order.id)

  pendingOrderPopup(store, {
    id: order.id,
    chainId: payload.chainId,
  })

  if (orderObject) {
    orderAnalytics('Posted', orderObject.order.class, 'Presign')
  }
}
