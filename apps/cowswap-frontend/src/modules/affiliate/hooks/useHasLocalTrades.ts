import { useMemo } from 'react'

import { Address, areAddressesEqual } from '@cowprotocol/cow-sdk'

import { useSelector } from 'react-redux'

import { AppState } from 'legacy/state'
import { OrderStatus } from 'legacy/state/orders/actions'
import { flatOrdersStateNetwork } from 'legacy/state/orders/flatOrdersStateNetwork'
import { getDefaultNetworkState, OrdersState } from 'legacy/state/orders/reducer'

import { logAffiliate } from '../utils/logger'

/**
 * Check if a trader has past trades in local state, to avoid additional api calls to cow api.
 */
export function useHasLocalTrades(account: Address | undefined): boolean {
  const ordersState = useSelector<AppState, OrdersState | undefined>((state) => state.orders)

  return useMemo(() => {
    if (!account || !ordersState) {
      return false
    }

    logAffiliate('checking local state for past trades. trader:', account)
    const hasPastTrades = Object.entries(ordersState).some(([networkId, networkState]) => {
      const fullState = { ...getDefaultNetworkState(Number(networkId)), ...(networkState || {}) }
      const ordersMap = flatOrdersStateNetwork(fullState)

      return Object.values(ordersMap).some(
        (order) =>
          order?.order.owner &&
          areAddressesEqual(order.order.owner, account) &&
          order.order.status === OrderStatus.FULFILLED,
      )
    })

    logAffiliate(
      'checked local state for past trades. trader:',
      account,
      hasPastTrades ? 'has past trades' : 'does not have past trades',
    )
    return hasPastTrades
  }, [account, ordersState])
}
