import { TwapOrdersList } from 'entities/twap'

import { generateTwapOrderParts } from './buildTwapParts'

import { TwapPartOrders } from '../state/twapPartOrdersAtom'
import { TwapOrderItem } from '../types'

export async function buildPrototypePartOrders(
  orders: TwapOrderItem[],
  accountLowerCase: string,
  chainId: number,
): Promise<TwapPartOrders> {
  const partOrdersList = await Promise.all(
    orders.map((order) => {
      return generateTwapOrderParts(order, accountLowerCase, chainId)
    }),
  )

  return Object.assign({}, ...partOrdersList)
}

export function getFilteredPrototypeState(
  allTwapOrders: TwapOrdersList,
  allPartOrders: TwapPartOrders,
  chainId: number,
  accountLowerCase: string,
): {
  nextOrders: TwapOrdersList
  nextPartOrders: TwapPartOrders
} {
  const nextOrders = Object.fromEntries(
    Object.entries(allTwapOrders).filter(([, order]) => !isCurrentPrototypeOrder(order, chainId, accountLowerCase)),
  )
  const nextPartOrders = Object.fromEntries(
    Object.entries(allPartOrders).filter(([, partOrders]) => {
      return !partOrders.some((partOrder) => {
        return partOrder.isPrototype && partOrder.chainId === chainId && partOrder.safeAddress === accountLowerCase
      })
    }),
  )

  return { nextOrders, nextPartOrders }
}

export function isCurrentPrototypeOrder(order: TwapOrderItem, chainId: number, accountLowerCase: string): boolean {
  return !!order.isPrototype && order.chainId === chainId && order.safeAddress.toLowerCase() === accountLowerCase
}
