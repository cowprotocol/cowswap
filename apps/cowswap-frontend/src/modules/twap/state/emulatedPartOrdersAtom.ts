import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'
import { TokensByAddress } from '@cowprotocol/tokens'

import { twapOrdersAtom, TwapOrdersList, twapOrdersTokensAtom } from 'entities/twap'
import { observe } from 'jotai-effect'

import { Order } from 'legacy/state/orders/actions'

import { TwapPartOrderItem, twapPartOrdersListAtom } from './twapPartOrdersAtom'

import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

/**
 * Used to trigger `emulatedPartOrdersAtom`.
 * */
export const partOrdersRefreshTriggerAtom = atom(0)

export const emulatedPartOrdersAtom = atom<Order[]>((get) => {
  get(partOrdersRefreshTriggerAtom)

  const twapOrders = get(twapOrdersAtom)
  const twapParticleOrders = get(twapPartOrdersListAtom)
  const twapOrdersTokens = get(twapOrdersTokensAtom)

  if (!twapOrdersTokens) return []

  return emulatePartOrders(twapParticleOrders, twapOrders, twapOrdersTokens)
})

/**
 * Next part-order expiry time in ms (min validTo among non-expired), or `null`.
 * Used to schedule the timeout that will update `partOrdersRefreshTriggerAtom`
 * to trigger `emulatedPartOrdersAtom` to re-run.
 * */
export const nextPartOrderExpiryMsAtom = atom((get) => {
  const orders = get(emulatedPartOrdersAtom)
  const now = Date.now()

  let minValidToMs = Infinity

  for (const order of orders) {
    const validToMs = order.validTo * 1000

    if (validToMs > now) {
      minValidToMs = Math.min(minValidToMs, validToMs)
    }
  }

  return minValidToMs === Infinity ? null : minValidToMs
})

partOrdersRefreshTriggerAtom.onMount = () => {
  let timeoutId = 0

  const unobserve = observe((get, set) => {
    const nextExpiryMs = get(nextPartOrderExpiryMsAtom)

    clearTimeout(timeoutId)
    timeoutId = 0

    if (nextExpiryMs === null) {
      return
    }

    const now = Date.now()

    if (nextExpiryMs <= now) {
      set(partOrdersRefreshTriggerAtom, now)
    } else {
      timeoutId = window.setTimeout(() => {
        set(partOrdersRefreshTriggerAtom, Date.now())
      }, nextExpiryMs - now)
    }
  }, jotaiStore)

  return () => {
    window.clearTimeout(timeoutId)
    unobserve()
  }
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

    const enrichedOrder = emulatePartAsOrder(item, parent)
    const order = mapPartOrderToStoreOrder(item, enrichedOrder, isVirtualPart, parent, tokensByAddress)

    if (order) acc.push(order)

    return acc
  }, [])
}
