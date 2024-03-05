import { useMemo } from 'react'

import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { getIsComposableCowOrder } from 'utils/orderUtils/getIsComposableCowOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'

import { TabOrderTypes } from '../../../types'
import { groupOrdersTable } from '../../../utils/groupOrdersTable'
import { getParsedOrderFromTableItem, isParsedOrder, OrderTableItem } from '../../../utils/orderTableGroupUtils'

export interface OrdersTableList {
  pending: OrderTableItem[]
  history: OrderTableItem[]
}

const ordersSorter = (a: OrderTableItem, b: OrderTableItem) => {
  const aCreationTime = getParsedOrderFromTableItem(a).creationTime
  const bCreationTime = getParsedOrderFromTableItem(b).creationTime

  return bCreationTime.getTime() - aCreationTime.getTime()
}

const ORDERS_LIMIT = 100

export function useOrdersTableList(allOrders: Order[], orderType: TabOrderTypes): OrdersTableList {
  const allSortedOrders = useMemo(() => {
    return groupOrdersTable(allOrders).sort(ordersSorter)
  }, [allOrders])

  return useMemo(() => {
    const { pending, history } = allSortedOrders.reduce(
      (acc, item) => {
        const order = isParsedOrder(item) ? item : item.parent

        const advancedTabNonAdvancedOrder = orderType === TabOrderTypes.ADVANCED && getIsNotComposableCowOrder(order)
        const limitTabNonLimitOrder = orderType === TabOrderTypes.LIMIT && getIsComposableCowOrder(order)

        if (advancedTabNonAdvancedOrder || limitTabNonLimitOrder) {
          // Skip if order type doesn't match
          return acc
        }

        if (PENDING_STATES.includes(order.status)) {
          acc.pending.push(item)
        } else {
          acc.history.push(item)
        }

        return acc
      },
      { pending: [], history: [] } as OrdersTableList
    )

    return { pending: pending.slice(0, ORDERS_LIMIT), history: history.slice(0, ORDERS_LIMIT) }
  }, [allSortedOrders, orderType])
}
