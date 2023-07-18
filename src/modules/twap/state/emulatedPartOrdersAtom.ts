import { atom } from 'jotai'

import { CONFIRMED_STATES, Order } from 'legacy/state/orders/actions'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'

import { twapOrdersAtom } from './twapOrdersListAtom'
import { twapPartOrdersListAtom } from './twapPartOrdersAtom'

import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

export const emulatedPartOrdersAtom = atom<Order[]>((get) => {
  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)
  const tokensByAddress = get(tokensByAddressAtom)

  return twapParticleOrders.reduce<Order[]>((acc, item) => {
    if (item.isCreatedInOrderBook) return acc

    const isVirtualPart = true
    const parent = twapOrders[item.twapOrderId]

    if (!parent) return acc

    const enrichedOrder = emulatePartAsOrder(item, parent)
    const order = mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress)

    if (!CONFIRMED_STATES.includes(order.status)) {
      acc.push(order)
    }

    return acc
  }, [])
})
