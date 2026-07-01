import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { reduxOrdersStateAtom } from './redux/reduxOrders.atom'
import { getReduxOrdersByStatusFromNetworkState, getReduxOrdersStateByChain } from './redux/reduxOrders.utils'

/**
 * Pending orders for permit / partial-approve flows that must not depend on
 * `ordersTableOrderTypeAtom` (e.g. swap approve modal, account partial approve).
 */
export const onlyPendingOrdersAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)

  if (!chainId || !account) return []

  const reduxOrdersState = get(reduxOrdersStateAtom)
  const reduxOrdersStateInCurrentChain = getReduxOrdersStateByChain(reduxOrdersState, chainId)

  const reduxOrders = getReduxOrdersByStatusFromNetworkState(account, reduxOrdersStateInCurrentChain.pending)

  return reduxOrders
})
