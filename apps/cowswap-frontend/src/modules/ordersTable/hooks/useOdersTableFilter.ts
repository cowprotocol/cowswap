import { useMemo } from 'react'

import { isOrderFilled } from 'utils/orderUtils/isOrderFilled'
import { isPartiallyFilled } from 'utils/orderUtils/isPartiallyFilled'

import { OrderTableItem } from '../types'
import { getParsedOrderFromTableItem } from '../utils/orderTableGroupUtils'

export function useFilteredHistoryOrders(
  orders: OrderTableItem[] | undefined,
  showOnlyFilled: boolean,
): OrderTableItem[] | undefined {
  return useMemo(() => {
    if (!showOnlyFilled || !orders) return orders

    return orders.filter((item) => {
      const parsedOrder = getParsedOrderFromTableItem(item);

      return isOrderFilled(parsedOrder) || isPartiallyFilled(parsedOrder)
    })
  }, [orders, showOnlyFilled])
}
