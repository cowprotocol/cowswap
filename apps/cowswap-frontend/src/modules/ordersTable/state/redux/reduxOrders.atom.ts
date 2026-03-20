import { atom } from 'jotai'

import { areAddressesEqual, SupportedChainId, getAddressKey } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { ORDER_LIST_KEYS, OrdersState, OrdersStateNetwork, getDefaultNetworkState } from 'legacy/state/orders/reducer'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'
import { atomFromReduxSelector } from 'legacy/utils/atomFromReduxSelector'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

const reduxOrdersStateAtom = atomFromReduxSelector<OrdersState>((appState) => appState.orders)

export const reduxOrdersStateByChainAtom = atom((get) => (chainId: SupportedChainId) => {
  if (!chainId) return {} as OrdersStateNetwork

  const reduxOrdersStateByChain = get(reduxOrdersStateAtom)?.[chainId] || {}

  return { ...getDefaultNetworkState(chainId), ...reduxOrdersStateByChain }
})

export const reduxOrdersByOrderTypeAtom = atom((get) => (uiOrderType: UiOrderType) => {
  const { chainId, account } = get(walletInfoAtom)

  if (!chainId || !account) {
    return {
      reduxOrdersStateInCurrentChain: null,
      reduxOrders: null,
      ordersTokensSet: null,
    }
  }

  const reduxOrders: Order[] = []
  const ordersTokensSet = new Set<string>()
  const reduxOrdersStateInCurrentChain = get(reduxOrdersStateByChainAtom)(chainId)

  // TODO: `reduxOrdersStateInCurrentChain` are already classified by state: cancelled, creating, expired, failed...
  //
  // Therefore, it might be possible to map them directly between those states and into the target state (`orders`)
  // using `tabId`, and without using `_concatOrdersState` at all, optimizing the logic below.

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

  return { reduxOrdersStateInCurrentChain, reduxOrders, ordersTokensSet }
})
