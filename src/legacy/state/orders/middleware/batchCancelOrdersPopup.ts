import { Dispatch, MiddlewareAPI } from 'redux'

import { orderAnalytics } from '../../../components/analytics'
import { addPopup, AddPopupPayload } from '../../application/reducer'
import { AppState } from '../../index'
import { CancelOrdersBatchParams, SerializedOrder } from '../actions'
import { buildCancellationPopupSummary } from '../buildCancellationPopupSummary'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { OrdersStateNetwork } from '../reducer'

export function batchCancelOrdersPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: CancelOrdersBatchParams,
  orders: OrdersStateNetwork
) {
  // construct Cancelled Order Popups for each Order
  payload.ids.forEach((id) => {
    const orderObject = getOrderByIdFromState(orders, id)

    if (orderObject) {
      const { order } = orderObject

      const popup = _buildCancellationPopup(order)
      orderAnalytics('Canceled', order.class)

      store.dispatch(addPopup(popup))
    }
  })
}

function _buildCancellationPopup(order: SerializedOrder) {
  const { cancellationHash, apiAdditionalInfo, id, summary } = order

  if (cancellationHash && !apiAdditionalInfo) {
    // EthFlow order which has been cancelled and does not exist on the backend
    // Use the `tx` popup
    return setPopupData(OrderTxTypes.TXN, {
      success: true,
      summary: buildCancellationPopupSummary(id, summary),
      hash: cancellationHash,
      id,
    }) as unknown as AddPopupPayload
  } else {
    // Regular order being cancelled
    // Use `metatx` popup
    return setPopupData(OrderTxTypes.METATXN, {
      success: true,
      summary: buildCancellationPopupSummary(id, summary),
      id,
    }) as unknown as AddPopupPayload
  }
}
