import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { twapOrdersListAtom, mapTwapOrderToStoreOrder, twapOrdersTokensAtom } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'

/**
 * Returns a list of emulated twap orders
 */
export const emulatedTwapOrdersAtom = atom<Order[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)
  const allTwapOrders = get(twapOrdersListAtom)
  const twapOrdersTokens = get(twapOrdersTokensAtom)

  if (!twapOrdersTokens) return []

  const accountLowerCase = account?.toLowerCase()

  return allTwapOrders.reduce<Order[]>((acc, order) => {
    if (order.chainId !== chainId || order.safeAddress.toLowerCase() !== accountLowerCase) {
      return acc
    }

    const storeOrder = mapTwapOrderToStoreOrder(order, twapOrdersTokens)

    if (storeOrder) acc.push(storeOrder)

    return acc
  }, [])
})
