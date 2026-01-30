import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { PENDING_STATES } from 'legacy/state/orders/actions'

import { useOrdersTableState } from '../../state/useOrdersTableState'
import { tableItemsToOrders } from '../utils/orderTableGroupUtils'

const PROTOCOL_FEE_START_DATE = new Date('2025-11-26T00:00:00Z')

export function useShouldDisplayProtocolFeeBanner(): boolean {
  const { orders } = useOrdersTableState() || {}
  const { isLimitOrdersProtocolFeeBannerEnabled } = useFeatureFlags()

  return useMemo(() => {
    if (!isLimitOrdersProtocolFeeBannerEnabled) return false
    if (!orders || orders.length === 0) return false

    const allOrders = tableItemsToOrders(orders)
    const activeOrders = allOrders.filter((order) => PENDING_STATES.includes(order.status))
    return activeOrders.some((order) => order.creationTime < PROTOCOL_FEE_START_DATE)
  }, [orders, isLimitOrdersProtocolFeeBannerEnabled])
}
