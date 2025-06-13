interface OrderTokensToFetch {
  sellToken: string
  buyToken: string
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOrderToFetch = (input: any): input is OrderTokensToFetch => !!input.sellToken

export function getTokensListFromOrders(orders: (OrderTokensToFetch | { order: OrderTokensToFetch })[]): string[] {
  const set = new Set<string>()

  orders.forEach((input) => {
    const order = isOrderToFetch(input) ? input : input.order

    set.add(order.sellToken)
    set.add(order.buyToken)
  })

  return Array.from(set)
}
