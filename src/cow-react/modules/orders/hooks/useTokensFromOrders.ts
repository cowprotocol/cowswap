import { useMemo } from 'react'
import { Order } from '@cow/modules/orders'

export function useTokensFromOrders(orders: Order[]) {
  return useMemo(() => {
    return orders.map((order) => order.inputToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.map((order) => order.sellToken).join('')])
}
