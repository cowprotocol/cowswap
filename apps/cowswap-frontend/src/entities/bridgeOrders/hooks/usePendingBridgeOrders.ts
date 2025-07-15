import { useMemo } from 'react'

import { BridgeOrderData } from 'common/types/bridge'

import { useBridgeOrders } from './useBridgeOrders'
import { BRIDGING_FINAL_STATUSES } from './useCrossChainOrder'

export function usePendingBridgeOrders(): BridgeOrderData[] | null {
  const bridgeOrders = useBridgeOrders()

  return useMemo(
    () =>
      bridgeOrders
        ? bridgeOrders.filter((order) =>
            order.statusResult ? !BRIDGING_FINAL_STATUSES.includes(order.statusResult.status) : true,
          )
        : null,
    [bridgeOrders],
  )
}
