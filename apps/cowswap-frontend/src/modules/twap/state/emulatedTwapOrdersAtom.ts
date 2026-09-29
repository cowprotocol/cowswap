import { atom } from 'jotai'

import { twapOrdersListAtom, mapTwapOrderToStoreOrder, twapOrdersTokensAtom } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'

/**
 * Returns a list of emulated twap orders
 */
export const emulatedTwapOrdersAtom = atom<Order[]>((get) => {
  const allTwapOrders = get(twapOrdersListAtom)
  const twapOrdersTokens = get(twapOrdersTokensAtom)

  if (!twapOrdersTokens) return []

  return allTwapOrders.reduce<Order[]>((acc, order) => {
    const storeOrder = mapTwapOrderToStoreOrder(order, twapOrdersTokens)

    if (storeOrder) acc.push(storeOrder)

    return acc
  }, [])
})
