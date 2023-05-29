import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { orderAnalytics } from '../../../components/analytics'
import { AddPendingOrderParams } from '../actions'
import { MiddlewareAPI } from '@reduxjs/toolkit'
import { AppState } from '../../index'
import { Dispatch } from 'redux'
import { addPopup, AddPopupPayload } from '../../application/reducer'

export function pendingOrderPopup(store: MiddlewareAPI<Dispatch, AppState>, payload: AddPendingOrderParams) {
  const { id, chainId } = payload

  // use current state to lookup orders' data
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, id)

  if (!orderObject) {
    return
  }
  // look up Order.summary for Popup
  const { summary, class: orderClass } = orderObject.order

  let popup: AddPopupPayload | undefined = undefined

  const hash = orderObject.order.orderCreationHash
  if (hash) {
    // EthFlow Order
    popup = setPopupData(OrderTxTypes.TXN, {
      summary,
      status: 'submitted',
      id: hash,
      hash,
    }) as AddPopupPayload
    orderAnalytics('Posted', orderClass, 'EthFlow')
  } else if (!payload.order.isHidden) {
    // Pending Order Popup, if it's not hidden
    popup = setPopupData(OrderTxTypes.METATXN, { summary, status: 'submitted', id })
    orderAnalytics('Posted', orderClass, 'Offchain')
  }

  if (popup) {
    store.dispatch(addPopup(popup))
  }
}
