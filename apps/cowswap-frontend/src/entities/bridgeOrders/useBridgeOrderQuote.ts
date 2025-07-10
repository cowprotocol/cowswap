import { useMemo } from 'react'

import { BridgeQuoteAmounts } from 'common/types/bridge'

import { usePendingBridgeOrders } from './usePendingBridgeOrders'

export function useBridgeOrderQuote(orderUid: string | undefined): BridgeQuoteAmounts | undefined {
  const pendingBridgeOrders = usePendingBridgeOrders()

  return useMemo(() => {
    if (!pendingBridgeOrders) return undefined

    return pendingBridgeOrders.find((order) => order.orderUid === orderUid)?.amounts
  }, [pendingBridgeOrders, orderUid])
}
