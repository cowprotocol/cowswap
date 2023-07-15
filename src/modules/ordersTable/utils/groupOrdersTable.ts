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

    // Parent
    if (composableOrderId) {
      const group = groupsMap.get(composableOrderId)

      if (!group) {
        groupsMap.set(composableOrderId, { parent: parsedOrder, children: [] })
      } else {
        group.parent = parsedOrder
      }
      // Child
    } else if (parentOrderId) {
      const group = groupsMap.get(parentOrderId)

      if (!group) {
        groupsMap.set(parentOrderId, { parent: null, children: [] })
      } else {
        group.children.push(parsedOrder)
      }
      // Regular order
    } else {
      acc.push(parsedOrder)
    }

    return acc
  }, [])

  const groups = Array.from(groupsMap.entries()) //
    .reduce<OrderTableGroup[]>((acc, [, group]) => {
      if (group.parent) {
        const isParentPending = PENDING_STATES.includes(group.parent.status)

        const children = group.children.filter((child) => {
          return isParentPending ? PENDING_STATES.includes(child.status) : !PENDING_STATES.includes(child.status)
        })

        acc.push({ parent: group.parent, children })
      }
      return acc
    }, [])

  return [...orders, ...groups]
}
