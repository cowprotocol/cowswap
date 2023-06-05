import { Order } from 'legacy/state/orders/actions'

import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { TwapToDiscreteOrders } from '../hooks/useDiscreteOrdersFromOrderBook'
import { TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrderItem, TwapOrderInfo, TwapOrdersAuthResult } from '../types'

export function getTwapOrdersItems(
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  discreteOrders: TwapToDiscreteOrders
): TwapOrderItem[] {
  return ordersInfo.map(({ safeData, id }) => {
    return getTwapOrderItem(safeAddress, safeData, id, ordersAuthResult[id], discreteOrders[id])
  })
}

function getTwapOrderItem(
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  hash: string,
  authorized: boolean,
  discreteOrder: Order | undefined
): TwapOrderItem {
  const { params, submissionDate, isExecuted } = safeData

  const order = parseTwapOrderStruct(params.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, authorized, discreteOrder)

  return {
    order,
    status,
    safeAddress,
    hash,
    submissionDate,
  }
}
