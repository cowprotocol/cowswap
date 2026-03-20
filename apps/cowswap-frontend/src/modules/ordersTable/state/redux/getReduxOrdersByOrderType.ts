import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { Address } from 'viem'

import { Order } from 'legacy/state/orders/actions'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { ORDER_LIST_KEYS, OrdersStateNetwork } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

export interface GetReduxOrdersByOrderTypeParams {
  account: Address
  reduxOrdersStateInCurrentChain: OrdersStateNetwork
  uiOrderType: UiOrderType
}

export interface ReduxOrdersByOrderTypeData {
  reduxOrders: Order[]
  ordersTokensSet: Set<string>
}

/**
 * Maps Redux per-chain order state into deserialized `Order[]` for a single `UiOrderType`.
 * Pure: no Jotai `get`, no Redux dispatch — safe to call from any atom read path.
 */
export function getReduxOrdersByOrderTypeFromNetworkState({
  account,
  reduxOrdersStateInCurrentChain,
  uiOrderType,
}: GetReduxOrdersByOrderTypeParams): ReduxOrdersByOrderTypeData {
  const reduxOrders: Order[] = []
  const ordersTokensSet = new Set<string>()

  _concatOrdersState(reduxOrdersStateInCurrentChain, ORDER_LIST_KEYS).forEach((order) => {
    if (!order) return

    const doesBelongToAccount = areAddressesEqual(order.order.owner, account)
    const orderUiOrderType = getUiOrderType(order.order)
    const doesMatchClass = orderUiOrderType === uiOrderType

    if (!doesBelongToAccount || !doesMatchClass) return

    const mappedOrder = deserializeOrder(order)

    if (!mappedOrder || mappedOrder.isHidden) return

    reduxOrders.push(mappedOrder)
    ordersTokensSet.add(getAddressKey(mappedOrder.inputToken.address))
  })

  return { reduxOrders, ordersTokensSet }
}
