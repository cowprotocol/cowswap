import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { TokensByAddress } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { mapTwapOrderToStoreOrder } from '../utils/mapTwapOrderToStoreOrder'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

/**
 * Returns a list of emulated twap orders
 *
 * `tokenByAddress` is a map of all known tokens, it comes from `useTwapOrdersTokens()` hook
 * `useTwapOrdersTokens()` fetches unknown tokens from blockchain and stores them in the store
 * So, there might be a race condition when we have an order but haven't fetched its token yet
 * Because of it, we wrap mapTwapOrderToStoreOrder() in try/catch and just don't add an order to the list
 */
export function useEmulatedTwapOrders(tokensByAddress: TokensByAddress | undefined): Order[] {
  const { account, chainId } = useWalletInfo()
  const allTwapOrders = useAtomValue(twapOrdersListAtom)
  // Update emulated twap orders every 5 seconds to recalculate expired state
  const refresher = useMachineTimeMs(EMULATED_ORDERS_REFRESH_MS)

  const accountLowerCase = account?.toLowerCase()

  return useMemo(() => {
    // It's not possible, just to prevent react-hooks/exhaustive-deps errors
    if (!refresher) return []
    if (!tokensByAddress) return []

    return allTwapOrders.reduce<Order[]>((acc, order) => {
      if (order.chainId !== chainId || order.safeAddress.toLowerCase() !== accountLowerCase) {
        return acc
      }

      const storeOrder = mapTwapOrderToStoreOrder(order, tokensByAddress)

      if (storeOrder) acc.push(storeOrder)

      return acc
    }, [])
  }, [allTwapOrders, accountLowerCase, chainId, tokensByAddress, refresher])
}
