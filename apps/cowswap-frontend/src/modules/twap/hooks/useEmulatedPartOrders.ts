import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useMachineTimeMs } from '@cowprotocol/common-hooks'
import { TokensByAddress } from '@cowprotocol/tokens'
import { atom } from 'jotai'
import { twapOrdersAtom, TwapOrdersList } from 'entities/twap'
import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

import { TwapPartOrderItem, twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'
import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'
import { twapOrdersTokensLoadableAtom } from 'entities/twap/hooks/useTwapOrdersTokens'

const EMULATED_ORDERS_REFRESH_MS = ms`5s`

export const emulatedPartOrdersAtom = atom<Order[]>((get) => {
  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)
  const twapOrdersTokensLoadable = useAtomValue(twapOrdersTokensLoadableAtom)

  // Update emulated part orders every 5 seconds to recalculate expired state
  // TODO: Replace this with an atom version and try to make
  // refresh interval smart...
  const refresher = useMachineTimeMs(EMULATED_ORDERS_REFRESH_MS)

  // It's not possible, just to prevent react-hooks/exhaustive-deps errors
  if (!refresher) return []
  if (!twapOrdersTokensLoadable || twapOrdersTokensLoadable.state !== 'hasData') return []

  return emulatePartOrders(twapParticleOrders, twapOrders, twapOrdersTokensLoadable.data)
})

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

    const enrichedOrder = emulatePartAsOrder(item, parent)
    const order = mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress)

    if (order) acc.push(order)

    return acc
  }, [])
}
