import { getOrderByIdFromState, OrderTxTypes, PopupPayload, setPopupData } from '../helpers'
import { orderAnalytics } from '../../../components/analytics'
import { AddPendingOrderParams } from '../actions'
import { MiddlewareAPI } from '@reduxjs/toolkit'
import { AppState } from '../../index'
import { Dispatch } from 'redux'
import { addPopup } from '../../application/reducer'

export function pendingOrderActionMiddleware(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: AddPendingOrderParams,
  result: any
) {
  const { id, chainId } = payload

  // use current state to lookup orders' data
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, id)

  if (!orderObject) {
    return result
  }
  // look up Order.summary for Popup
  const { summary, class: orderClass } = orderObject.order

  let popup: PopupPayload

  const hash = orderObject.order.orderCreationHash
  if (hash) {
    // EthFlow Order
    popup = setPopupData(OrderTxTypes.TXN, {
      summary,
      status: 'submitted',
      id: hash,
      hash,
    })
    orderAnalytics('Posted', orderClass, 'EthFlow')
  } else if (!payload.order.isHidden) {
    // Pending Order Popup, if it's not hidden
    popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'submitted', id })
    orderAnalytics('Posted', orderClass, 'Offchain')
  }

  if (popup) {
    store.dispatch(
      addPopup({
        id,
        popup,
      })
    )
  }
}
