import { usePendingBridgeOrders } from 'entities/bridgeOrders'

import { useCategorizeRecentActivity } from './useCategorizeRecentActivity'

export function usePendingActivitiesCount(): number {
  const { pendingActivity: pendingIds } = useCategorizeRecentActivity()

  const pendingBridgeOrders = usePendingBridgeOrders()

  const pendingBridgeOrdersFiltered = pendingBridgeOrders?.filter((order) => {
    return !pendingIds.includes(order.orderUid)
  })

  const pendingBridgeOrdersCount = pendingBridgeOrdersFiltered?.length ?? 0

  return pendingIds.length + pendingBridgeOrdersCount
}
