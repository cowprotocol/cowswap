import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { TokensByAddress } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

import { useSwapZeroFee } from '../../../common/hooks/featureFlags/useSwapZeroFee'
import { twapOrdersAtom, TwapOrdersList } from '../state/twapOrdersListAtom'
import { TwapPartOrderItem, twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'
import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

export function useEmulatedPartOrders(tokensByAddress: TokensByAddress | undefined): Order[] {
  const twapOrders = useAtomValue(twapOrdersAtom)
  const twapParticleOrders = useAtomValue(twapPartOrdersListAtom)
  // Update emulated part orders every 5 seconds to recalculate expired state
  const refresher = useMachineTimeMs(EMULATED_ORDERS_REFRESH_MS)
  const swapZeroFee = useSwapZeroFee()

  return useMemo(() => {
    // It's not possible, just to prevent react-hooks/exhaustive-deps errors
    if (!refresher) return []
    if (!tokensByAddress) return []

    return emulatePartOrders(twapParticleOrders, twapOrders, tokensByAddress, { swapZeroFee })
  }, [twapParticleOrders, twapOrders, tokensByAddress, refresher, swapZeroFee])
}

function emulatePartOrders(
  twapParticleOrders: TwapPartOrderItem[],
  twapOrders: TwapOrdersList,
  tokensByAddress: TokensByAddress,
  featureFlags: {
    swapZeroFee: boolean | undefined
  }
): Order[] {
  return twapParticleOrders.reduce<Order[]>((acc, item) => {
    if (item.isCreatedInOrderBook) return acc

    const isVirtualPart = true
    const parent = twapOrders[item.twapOrderId]

    if (!parent) return acc

    const enrichedOrder = emulatePartAsOrder(item, parent)
    const order = mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress, featureFlags)

    if (order) acc.push(order)

    return acc
  }, [])
}
