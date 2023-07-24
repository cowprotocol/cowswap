import { Dispatch, MiddlewareAPI } from 'redux'

import { orderAnalytics } from '../../../components/analytics'
import { addPopup, AddPopupPayload } from '../../application/reducer'
import { AppState } from '../../index'
import { BaseOrder } from '../actions'
import { buildCancellationPopupSummary } from '../buildCancellationPopupSummary'
import { OrderTxTypes, setPopupData } from '../helpers'

export function batchCancelOrdersPopup(store: MiddlewareAPI<Dispatch, AppState>, orders: BaseOrder[]) {
  // construct Cancelled Order Popups for each Order
  orders.forEach((order) => {
    const popup = _buildCancellationPopup(order)
    orderAnalytics('Canceled', order.class)

    store.dispatch(addPopup(popup))
  })
}

function _buildCancellationPopup(order: BaseOrder) {
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
