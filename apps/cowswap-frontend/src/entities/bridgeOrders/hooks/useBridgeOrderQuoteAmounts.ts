import { useMemo } from 'react'

import { BridgeQuoteAmounts } from 'common/types/bridge'

import { useBridgeOrders } from './useBridgeOrders'

export function useBridgeOrderQuoteAmounts(orderUid: string | undefined): BridgeQuoteAmounts | undefined {
  const pendingBridgeOrders = useBridgeOrders()

  return useMemo(() => {
    if (!pendingBridgeOrders) return undefined

    return pendingBridgeOrders.find((order) => order.orderUid === orderUid)?.quoteAmounts
  }, [pendingBridgeOrders, orderUid])
}
