import { TokensByAddress } from '@cowprotocol/tokens'
import { atom } from 'jotai'

import { twapOrdersAtom, TwapOrdersList } from 'entities/twap'
import { twapOrdersTokensAtom } from 'entities/twap/hooks/useTwapOrdersTokens'
import { Order } from 'legacy/state/orders/actions'

import { TwapPartOrderItem, twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'
import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

export const emulatedPartOrdersAtom = atom<Order[]>((get) => {
  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)
  const twapOrdersTokens = get(twapOrdersTokensAtom)

  if (!twapOrdersTokens) return []

  return emulatePartOrders(twapParticleOrders, twapOrders, twapOrdersTokens)
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
