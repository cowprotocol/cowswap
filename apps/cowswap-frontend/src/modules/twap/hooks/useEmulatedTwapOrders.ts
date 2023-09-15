import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import ms from 'ms.macro'

import useMachineTimeMs from 'legacy/hooks/useMachineTime'
import { Order } from 'legacy/state/orders/actions'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'
import { useWalletInfo } from 'modules/wallet'

import { twapOrdersListAtom } from '../state/twapOrdersListAtom'
import { mapTwapOrderToStoreOrder } from '../utils/mapTwapOrderToStoreOrder'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

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

      try {
        acc.push(mapTwapOrderToStoreOrder(order, tokensByAddress))
      } catch (e) {
        console.error(`[useEmulatedPartOrders] Failed to map order`, order, e)
      }
      return acc
    }, [])
  }, [allTwapOrders, accountLowerCase, chainId, tokensByAddress, refresher])
}
