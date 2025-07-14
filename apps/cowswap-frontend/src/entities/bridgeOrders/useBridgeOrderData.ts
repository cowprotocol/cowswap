import { useMemo } from 'react'

import { BridgeOrderData } from 'common/types/bridge'

import { useBridgeOrders } from './useBridgeOrders'

export function useBridgeOrderData(orderUid: string | undefined): BridgeOrderData | undefined {
  const bridgeOrders = useBridgeOrders()

  return useMemo(() => {
    if (!bridgeOrders) return undefined

    return bridgeOrders.find((order) => order.orderUid === orderUid)
  }, [bridgeOrders, orderUid])
}
