import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { TokensByAddress } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { twapOrdersTokensLoadableAtom } from 'entities/twap/hooks/useTwapOrdersTokens'
import { twapOrdersListAtom, mapTwapOrderToStoreOrder } from 'entities/twap'
import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

/**
 * Returns a list of emulated twap orders
 *
 * `tokenByAddress` is a map of all known tokens, it comes from `useTwapOrdersTokens()` hook
 * `useTwapOrdersTokens()` fetches unknown tokens from blockchain and stores them in the store
 * So, there might be a race condition when we have an order but haven't fetched its token yet
 * Because of it, we wrap mapTwapOrderToStoreOrder() in try/catch and just don't add an order to the list
 */
export const emulatedTwapOrdersAtom = atom<Order[]>((get) => {
  const { account, chainId } = useWalletInfo()
  const allTwapOrders = useAtomValue(twapOrdersListAtom)
  const twapOrdersTokensLoadable = useAtomValue(twapOrdersTokensLoadableAtom)

  // Update emulated twap orders every 5 seconds to recalculate expired state
  // TODO: Replace this with an atom version and try to make
  // refresh interval smart...
  const refresher = useMachineTimeMs(EMULATED_ORDERS_REFRESH_MS)

  const accountLowerCase = account?.toLowerCase()

  // It's not possible, just to prevent react-hooks/exhaustive-deps errors
  if (!refresher) return []
  if (!twapOrdersTokensLoadable || twapOrdersTokensLoadable.state !== 'hasData') return []

  return allTwapOrders.reduce<Order[]>((acc, order) => {
    if (order.chainId !== chainId || order.safeAddress.toLowerCase() !== accountLowerCase) {
      return acc
    }

    const storeOrder = mapTwapOrderToStoreOrder(order, twapOrdersTokensLoadable.data)

    if (storeOrder) acc.push(storeOrder)

    return acc
  }, [])
})
