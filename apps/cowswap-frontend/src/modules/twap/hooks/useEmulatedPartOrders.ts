import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { TokensByAddress } from '@cowprotocol/tokens'

import { twapOrdersAtom, TwapOrdersList } from 'entities/twap'
import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

import { useTwapPartOrdersList } from './useTwapPartOrdersList'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'
import { resolveDisplayTwapOrder } from '../utils/resolveDisplayTwapOrder'
import { resolveDisplayTwapPartOrder } from '../utils/resolveDisplayTwapPartOrder'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

export function useEmulatedPartOrders(tokensByAddress: TokensByAddress | undefined): Order[] {
  const twapOrders = useAtomValue(twapOrdersAtom)
  const twapParticleOrders = useTwapPartOrdersList()
  // Update emulated part orders every 5 seconds to recalculate expired state
  const refresher = useMachineTimeMs(EMULATED_ORDERS_REFRESH_MS)

  return useMemo(() => {
    // It's not possible, just to prevent react-hooks/exhaustive-deps errors
    if (!refresher) return []
    if (!tokensByAddress) return []

    return emulatePartOrders(twapParticleOrders, twapOrders, tokensByAddress)
  }, [twapParticleOrders, twapOrders, tokensByAddress, refresher])
}

function emulatePartOrders(
  twapParticleOrders: TwapPartOrderItem[],
  twapOrders: TwapOrdersList,
  tokensByAddress: TokensByAddress,
): Order[] {
  return twapParticleOrders.reduce<Order[]>((acc, item) => {
    if (item.isCreatedInOrderBook) return acc

    const isVirtualPart = true
    const parent = twapOrders[item.twapOrderId]

    if (!parent) return acc

    const resolvedParent = resolveDisplayTwapOrder(parent)
    const resolvedItem = resolveDisplayTwapPartOrder(item, resolvedParent)
    const enrichedOrder = emulatePartAsOrder(resolvedItem, resolvedParent)
    const order = mapPartOrderToStoreOrder(resolvedItem, enrichedOrder, isVirtualPart, resolvedParent, tokensByAddress)

    if (order) acc.push(order)

    return acc
  }, [])
}
