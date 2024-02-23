import { orderAnalytics } from '@cowprotocol/analytics'

import { Dispatch, MiddlewareAPI } from 'redux'

import { computeOrderSummary } from 'common/updaters/orders/utils'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { addPopup } from '../../application/reducer'
import { AppState } from '../../index'
import { ExpireOrdersBatchParams } from '../actions'
import * as OrderActions from '../actions'
import { getOrderByIdFromState, OrderTxTypes, setPopupData } from '../helpers'
import { OrdersStateNetwork } from '../reducer'
import { deserializeOrder } from '../utils/deserializeOrder'

export function batchExpireOrdersPopup(
  store: MiddlewareAPI<Dispatch, AppState>,
  payload: ExpireOrdersBatchParams,
  orders: OrdersStateNetwork
) {
  payload.ids.forEach((id) => {
    const orderObject = getOrderByIdFromState(orders, id)

    // Do not trigger expired pop up if order is hidden
    if (orderObject && !orderObject.order.isHidden) {
      const popup = setPopupData(OrderTxTypes.METATXN, {
        success: false,
        summary: computeOrderSummary({
          orderFromStore: deserializeOrder(orderObject),
          orderFromApi: null,
        }),
        id,
        status: OrderActions.OrderStatus.EXPIRED,
      })
      orderAnalytics('Expired', getUiOrderType(orderObject.order))

      store.dispatch(addPopup(popup))
    }
  })
}
