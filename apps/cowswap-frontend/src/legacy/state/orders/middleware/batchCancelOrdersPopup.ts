import { orderAnalytics } from '@cowprotocol/analytics'

import { Dispatch, MiddlewareAPI } from 'redux'

import { computeOrderSummary } from 'common/updaters/orders/utils'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { addPopup, AddPopupPayload } from '../../application/reducer'
import { AppState } from '../../index'
import { buildCancellationPopupSummary } from '../buildCancellationPopupSummary'
import { OrderTxTypes, setPopupData } from '../helpers'
import { OrderObject } from '../reducer'
import { deserializeOrder } from '../utils/deserializeOrder'

export function batchCancelOrdersPopup(store: MiddlewareAPI<Dispatch, AppState>, orders: OrderObject[]) {
  // construct Cancelled Order Popups for each Order
  orders.forEach((order) => {
    const popup = _buildCancellationPopup(order)

    orderAnalytics('Canceled', getUiOrderType(order.order))

    store.dispatch(addPopup(popup))
  })
}

function _buildCancellationPopup(order: OrderObject) {
  const { cancellationHash, apiAdditionalInfo, id } = order.order
  const summary = computeOrderSummary({
    orderFromStore: deserializeOrder(order),
    orderFromApi: null,
  })

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
