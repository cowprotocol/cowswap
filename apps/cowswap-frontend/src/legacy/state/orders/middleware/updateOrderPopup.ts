import { orderAnalytics } from '@cowprotocol/analytics'

import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { pendingOrderPopup } from './pendingOrderPopup'

import { AppState } from '../../index'
import { UpdateOrderParams } from '../actions'
import { getOrderByIdFromState } from '../helpers'

export function updateOrderPopup(store: MiddlewareAPI<Dispatch, AppState>, payload: UpdateOrderParams) {
  const { order, chainId } = payload
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, order.id)

  if (orderObject) {
    pendingOrderPopup(
      store,
      {
        id: order.id,
        chainId: payload.chainId,
        order: orderObject.order,
        isSafeWallet: payload.isSafeWallet,
      },
      true
    )

    orderAnalytics('Posted', getUiOrderType(orderObject.order), 'Presign')
  }
}
