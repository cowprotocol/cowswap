import { type OrderFillability } from 'modules/ordersTable'

type OrderLike = {
  id: string
  isUnfillable?: boolean
}

export function computeUnfillableOrderIds(
  marketOrders: OrderLike[],
  pendingOrdersFillability: Record<string, OrderFillability | undefined>,
): string[] {
  // `isUnfillable` is toggled on the client (see UnfillableOrdersUpdater and OrdersTableList) after comparing quotes and allowances.
  const priceDerived = marketOrders.filter((order) => order.isUnfillable).map((order) => order.id)

  const fillabilityDerived = Object.entries(pendingOrdersFillability).reduce<string[]>(
    (acc, [orderId, fillability]) => {
      if (!fillability) {
        return acc
      }

      const lacksBalance = fillability.hasEnoughBalance === false
      const lacksAllowance = fillability.hasEnoughAllowance === false && !fillability.hasPermit

      if (lacksBalance || lacksAllowance) {
        acc.push(orderId)
      }

      return acc
    },
    [],
  )

  // An order can be flagged by both mechanisms; the Set keeps the list unique.
  return Array.from(new Set([...priceDerived, ...fillabilityDerived]))
}

export function getNewlyFillableOrderIds(previous: Iterable<string>, current: Iterable<string>): string[] {
  const currentSet = new Set(current)
  const newlyFillable: string[] = []

  for (const orderId of previous) {
    if (!currentSet.has(orderId)) {
      newlyFillable.push(orderId)
    }
  }

  return newlyFillable
}
