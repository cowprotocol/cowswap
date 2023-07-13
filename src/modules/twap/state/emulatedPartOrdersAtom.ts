import { atom } from 'jotai'

import { Order } from 'legacy/state/orders/actions'

import { tokensByAddressAtom } from 'modules/tokensList/state/tokensListAtom'

import { twapOrdersAtom } from './twapOrdersListAtom'
import { twapPartOrdersListAtom } from './twapPartOrdersAtom'

import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

export const emulatedPartOrdersAtom = atom<Order[]>((get) => {
  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)
  const tokensByAddress = get(tokensByAddressAtom)

  return twapParticleOrders
    .filter((item) => !item.isSettledInOrderBook)
    .map<Order>((item) => {
      const isVirtualPart = true
      const parent = twapOrders[item.twapOrderId]
      const enrichedOrder = emulatePartAsOrder(item, parent)

      return mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress)
    })
})
