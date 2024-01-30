import { orderAnalytics } from '@cowprotocol/analytics'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { MiddlewareAPI } from '@reduxjs/toolkit'
import { Dispatch } from 'redux'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { showPendingOrderNotification } from './showPendingOrderNotification'

import { AppState } from '../../index'
import { AddPendingOrderParams } from '../actions'
import { getOrderByIdFromState } from '../helpers'

export function pendingOrderPopup(store: MiddlewareAPI<Dispatch, AppState>, payload: AddPendingOrderParams) {
  const { id, chainId } = payload

  // use current state to lookup orders' data
  const orders = store.getState().orders[chainId]
  const orderObject = getOrderByIdFromState(orders, id)

  if (!orderObject) {
    return
  }

  const order = orderObject.order

  const { orderCreationHash, isHidden, class: orderClass, receiver } = order

  const inputAmount = CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(order.inputToken), order.sellAmount)
  const outputAmount = CurrencyAmount.fromRawAmount(TokenWithLogo.fromToken(order.outputToken), order.buyAmount)

  showPendingOrderNotification({
    ...order,
    receiver,
    inputAmount,
    outputAmount,
    uiOrderType: getUiOrderType(order),
  })

  if (orderCreationHash) {
    // EthFlow Order
    orderAnalytics('Posted', orderClass, 'EthFlow')
  } else if (!isHidden) {
    // Pending Order Popup, if it's not hidden
    orderAnalytics('Posted', orderClass, 'Offchain')
  }
}
