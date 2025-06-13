import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder, parseOrder } from 'utils/orderUtils/parseOrder'

import { OrderTableGroup, OrderTableItem } from './orderTableGroupUtils'

interface OrderTableGroupMapItem {
  parent: ParsedOrder | null
  children: ParsedOrder[]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const childrenOrdersSorter = (a: ParsedOrder, b: ParsedOrder) => {
  return a.creationTime.getTime() - b.creationTime.getTime()
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
        acc.push({
          parent: group.parent,
          children: group.children.sort(childrenOrdersSorter),
        })
      }
      return acc
    }, [])

  return [...orders, ...groups]
}
