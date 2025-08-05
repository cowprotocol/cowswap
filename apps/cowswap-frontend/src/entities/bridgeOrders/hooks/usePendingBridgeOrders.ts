import { useMemo } from 'react'

import { BridgeOrderData } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderStatus } from 'legacy/state/orders/actions'
import { useAllOrdersMap } from 'legacy/state/orders/hooks'

import { useBridgeOrders } from './useBridgeOrders'
import { BRIDGING_FINAL_STATUSES } from './useCrossChainOrder'

const FAILED_ORDER_STATES = [OrderStatus.EXPIRED, OrderStatus.CANCELLED, OrderStatus.FAILED]

export function usePendingBridgeOrders(): BridgeOrderData[] | null {
  const { chainId } = useWalletInfo()
  const bridgeOrders = useBridgeOrders()
  const allOrdersMap = useAllOrdersMap({ chainId })

  return useMemo(
    () =>
      bridgeOrders
        ? bridgeOrders.filter((order) => {
            const regularOrder = allOrdersMap[order.orderUid]
            const status = regularOrder?.order.status
            const isSwapWontHappen = status ? FAILED_ORDER_STATES.includes(status) : false

            if (isSwapWontHappen) return false

            return order.statusResult ? !BRIDGING_FINAL_STATUSES.includes(order.statusResult.status) : true
          })
        : null,
    [bridgeOrders, allOrdersMap],
  )
}
