import { useMemo } from 'react'

import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { getIsComposableCowOrder } from 'utils/orderUtils/getIsComposableCowOrder'
import { getIsNotComposableCowOrder } from 'utils/orderUtils/getIsNotComposableCowOrder'

import { TabOrderTypes } from '../../../types'
import { getOrderParams } from '../../../utils/getOrderParams'
import { groupOrdersTable } from '../../../utils/groupOrdersTable'
import { getParsedOrderFromTableItem, isParsedOrder, OrderTableItem } from '../../../utils/orderTableGroupUtils'

export interface OrdersTableList {
  pending: OrderTableItem[]
  history: OrderTableItem[]
  unfillable: OrderTableItem[]
  all: OrderTableItem[]
}

const ordersSorter = (a: OrderTableItem, b: OrderTableItem) => {
  const aCreationTime = getParsedOrderFromTableItem(a).creationTime
  const bCreationTime = getParsedOrderFromTableItem(b).creationTime

  return bCreationTime.getTime() - aCreationTime.getTime()
}

const ORDERS_LIMIT = 100

export function useOrdersTableList(
  allOrders: Order[],
  orderType: TabOrderTypes,
  chainId: number,
  balancesAndAllowances: any,
): OrdersTableList {
  const allSortedOrders = useMemo(() => {
    return groupOrdersTable(allOrders).sort(ordersSorter)
  }, [allOrders])

  return useMemo(() => {
    const { pending, history, unfillable, all } = allSortedOrders.reduce(
      (acc, item) => {
        const order = isParsedOrder(item) ? item : item.parent

        const advancedTabNonAdvancedOrder = orderType === TabOrderTypes.ADVANCED && getIsNotComposableCowOrder(order)
        const limitTabNonLimitOrder = orderType === TabOrderTypes.LIMIT && getIsComposableCowOrder(order)

        if (advancedTabNonAdvancedOrder || limitTabNonLimitOrder) {
          // Skip if order type doesn't match
          return acc
        }

        // Add to 'all' list regardless of status
        acc.all.push(item)

        const isPending = PENDING_STATES.includes(order.status)

        // Check if order is unfillable (insufficient balance or allowance)
        const params = getOrderParams(chainId, balancesAndAllowances, order)
        const isUnfillable = params.hasEnoughBalance === false || params.hasEnoughAllowance === false

        // Only add to unfillable if the order is both pending and unfillable
        if (isPending && isUnfillable) {
          acc.unfillable.push(item)
        }

        // Add to pending or history based on status
        if (isPending) {
          acc.pending.push(item)
        } else {
          acc.history.push(item)
        }

        return acc
      },
      { pending: [], history: [], unfillable: [], all: [] } as OrdersTableList,
    )

    return {
      pending: pending.slice(0, ORDERS_LIMIT),
      history: history.slice(0, ORDERS_LIMIT),
      unfillable: unfillable.slice(0, ORDERS_LIMIT),
      all: all.slice(0, ORDERS_LIMIT),
    }
  }, [allSortedOrders, orderType, chainId, balancesAndAllowances])
}
