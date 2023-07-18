import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { ParsedOrder, parseOrder } from 'utils/orderUtils/parseOrder'

import { OrderTableGroup, OrderTableItem } from './orderTableGroupUtils'

interface OrderTableGroupMapItem {
  parent: ParsedOrder | null
  children: ParsedOrder[]
}

export function groupOrdersTable(allOrders: Order[]): OrderTableItem[] {
  const groupsMap = new Map<string, OrderTableGroupMapItem>()

  const orders = allOrders.reduce<ParsedOrder[]>((acc, order) => {
    const parsedOrder = parseOrder(order)
    const composableOrderId = order.composableCowInfo?.id
    const parentOrderId = order.composableCowInfo?.parentId
    const isPending = PENDING_STATES.includes(order.status)

    // Parent
    if (composableOrderId) {
      const group = groupsMap.get(composableOrderId)

      if (!group) {
        groupsMap.set(composableOrderId, { parent: parsedOrder, children: [] })
      } else {
        group.parent = parsedOrder
      }
      // Child
    } else if (parentOrderId && isPending) {
      if (!groupsMap.has(parentOrderId)) {
        groupsMap.set(parentOrderId, { parent: null, children: [] })
      }

      groupsMap.get(parentOrderId)!.children.push(parsedOrder)
      // Regular order
    } else {
      acc.push(parsedOrder)
    }

    return acc
  }, [])

  const groups = Array.from(groupsMap.entries()) //
    .reduce<OrderTableGroup[]>((acc, [, group]) => {
      if (group.parent) {
        acc.push(group as OrderTableGroup)
      }
      return acc
    }, [])

  return [...orders, ...groups]
}
