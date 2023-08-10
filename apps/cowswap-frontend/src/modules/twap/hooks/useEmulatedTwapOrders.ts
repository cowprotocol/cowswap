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

    return allTwapOrders
      .filter((order) => order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase)
      .map((order) => {
        return mapTwapOrderToStoreOrder(order, tokensByAddress)
      })
  }, [allTwapOrders, accountLowerCase, chainId, tokensByAddress, refresher])
}
