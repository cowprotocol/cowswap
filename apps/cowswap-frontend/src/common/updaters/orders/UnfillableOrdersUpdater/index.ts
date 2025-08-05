import { useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR, { SWRConfiguration } from 'swr'

import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useUpdatePendingOrders } from './hooks/useUpdatePendingOrders'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const pendingOrders = useOnlyPendingOrders(chainId, account)
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  const updatePending = useUpdatePendingOrders()

  const updatePendingRef = useRef(updatePending)
  updatePendingRef.current = updatePending

  useSWR(
    account && !isProviderNetworkUnsupported && pendingOrders.length
      ? [account, chainId, pendingOrders.length, 'UnfillableOrdersUpdater']
      : null,
    () => {
      return updatePendingRef.current(pendingOrdersRef.current)
    },
    SWR_CONFIG,
  )

  return null
}
