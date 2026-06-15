import { atom } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'

import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'
import { getReduxOrdersByOrderTypeFromNetworkState, getReduxOrdersStateByChain } from './redux/reduxOrders.utils'

/**
 * Limit pending orders for permit / partial-approve flows that must not depend on
 * `ordersTableOrderTypeAtom` (e.g. swap approve modal, account partial approve).
 */
export const limitPendingOrdersForPermitAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)

  if (!chainId || !account) return []

  const reduxOrdersStateInCurrentChain = getReduxOrdersStateByChain(get(reduxOrdersStateAtom), chainId)
  const { reduxOrders } = getReduxOrdersByOrderTypeFromNetworkState({
    account,
    reduxOrdersStateInCurrentChain,
    uiOrderType: UiOrderType.LIMIT,
  })

  return reduxOrders.filter((order) => order.status === OrderStatus.PENDING)
})
