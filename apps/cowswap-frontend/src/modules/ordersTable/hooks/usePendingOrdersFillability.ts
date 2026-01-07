import { OrderClass } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { useOrdersFillability, type OrderFillability } from './useOrdersFillability'

export type { OrderFillability } from './useOrdersFillability'

export { useOrdersFillability } from './useOrdersFillability'

export function usePendingOrdersFillability(orderClass?: OrderClass): Record<string, OrderFillability | undefined> {
  const { chainId, account } = useWalletInfo()
  const pendingOrders = useOnlyPendingOrders(chainId, account)

  const filteredOrders = orderClass ? pendingOrders.filter((order) => order.class === orderClass) : pendingOrders

  return useOrdersFillability(filteredOrders)
}
