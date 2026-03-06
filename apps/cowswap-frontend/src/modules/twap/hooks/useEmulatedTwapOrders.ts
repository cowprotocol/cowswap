import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { twapOrdersListAtom, mapTwapOrderToStoreOrder } from 'entities/twap'
import { twapOrdersTokensAtom } from 'entities/twap/state/twapOrdersTokensAtom'

import { Order } from 'legacy/state/orders/actions'

/**
 * Returns a list of emulated twap orders
 *
 * `tokenByAddress` is a map of all known tokens from twapOrdersTokensLoadableAtom,
 * which fetches unknown tokens from blockchain via atomWithQuery.
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
