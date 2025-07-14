import { useMemo } from 'react'

import { BridgeOrderData } from 'common/types/bridge'

import { useBridgeOrders } from './useBridgeOrders'

export function useBridgeOrderData(orderUid: string | undefined): BridgeOrderData | undefined {
  const pendingBridgeOrders = useBridgeOrders()

  return useMemo(() => {
    if (!pendingBridgeOrders) return undefined

    return pendingBridgeOrders.find((order) => order.orderUid === orderUid)
  }, [pendingBridgeOrders, orderUid])
}
