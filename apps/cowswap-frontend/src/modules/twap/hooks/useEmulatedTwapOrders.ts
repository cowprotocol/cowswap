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

      const orderDetails = mapTwapOrderToStoreOrder(order, tokensByAddress)
      if (orderDetails) {
        acc.push(orderDetails)
      }
      return acc
    }, [])
  }, [allTwapOrders, accountLowerCase, chainId, tokensByAddress, refresher])
}
