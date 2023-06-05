import { useCallback, useMemo } from 'react'

import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { useWalletInfo } from 'modules/wallet'

import { ordersSorter } from 'utils/orderUtils/ordersSorter'
import { ParsedOrder, parseOrder } from 'utils/orderUtils/parseOrder'

export interface OrdersTableList {
  pending: ParsedOrder[]
  history: ParsedOrder[]
}

const ORDERS_LIMIT = 100

export function useOrdersTableList(allOrders: Order[], customOrders?: ParsedOrder[]): OrdersTableList {
  const { account } = useWalletInfo()
  const accountLowerCase = account?.toLowerCase()

  const ordersFilter = useCallback(
    (order: Order) => order.owner.toLowerCase() === accountLowerCase && !order.isHidden,
    [accountLowerCase]
  )

  const parsedOrders = useMemo(() => {
    return allOrders.filter(ordersFilter).map(parseOrder)
  }, [allOrders, ordersFilter])

  const allSortedOrders = useMemo(() => {
    return [...parsedOrders, ...(customOrders || [])].sort(ordersSorter)
  }, [parsedOrders, customOrders])

  return useMemo(() => {
    const { pending, history } = allSortedOrders.reduce(
      (acc, order) => {
        if (PENDING_STATES.includes(order.status)) {
          acc.pending.push(order)
        } else {
          acc.history.push(order)
        }

        return acc
      },
      { pending: [], history: [] } as OrdersTableList
    )

    return { pending: pending.slice(0, ORDERS_LIMIT), history: history.slice(0, ORDERS_LIMIT) }
  }, [allSortedOrders])
}
