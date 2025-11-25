import { useMemo } from 'react'

import { PENDING_STATES } from 'legacy/state/orders/actions'

import { useOrdersTableState } from './useOrdersTableState'

import { tableItemsToOrders } from '../utils/orderTableGroupUtils'

const PROTOCOL_FEE_START_DATE = new Date('2025-11-26T00:00:00Z')

export function useHasActiveOrdersBeforeProtocolFee(): boolean {
  const { orders } = useOrdersTableState() || {}

  return useMemo(() => {
    if (!orders || orders.length === 0) return false

    const allOrders = tableItemsToOrders(orders)
    const activeOrders = allOrders.filter((order) => PENDING_STATES.includes(order.status))
    return activeOrders.some((order) => order.creationTime < PROTOCOL_FEE_START_DATE)
  }, [orders])
}
