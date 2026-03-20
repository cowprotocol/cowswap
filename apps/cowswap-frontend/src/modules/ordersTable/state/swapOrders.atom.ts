import { atom } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'

import { walletInfoAtom } from '../../../../../../libs/wallet/src/api/state'
import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { deserializeOrder } from 'legacy/state/orders/utils/deserializeOrder'
import { ORDER_LIST_KEYS } from 'legacy/state/orders/reducer'
import { _concatOrdersState } from 'legacy/state/orders/hooks'
import { Order } from 'legacy/state/orders/actions'
import { reduxOrdersStateByChainAtom } from './redux/reduxOrders.atom'

export const swapOrdersAtom = atom((get) => {
  // Note: Using `reduxOrdersByOrderTypeAtom` here triggers the following error for some reason:
  // Detected store mutation during atom read. This is not supported

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
    const doesMatchClass = orderUiOrderType === UiOrderType.SWAP

    if (!doesBelongToAccount || !doesMatchClass) return

    const mappedOrder = deserializeOrder(order)

    if (!mappedOrder || mappedOrder.isHidden) return

    reduxOrders.push(mappedOrder)
    ordersTokensSet.add(getAddressKey(mappedOrder.inputToken.address))
  })

  return { reduxOrdersStateInCurrentChain, reduxOrders, ordersTokensSet }
})
