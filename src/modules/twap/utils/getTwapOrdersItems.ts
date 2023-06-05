import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'
import { TwapDiscreteOrderItem, TwapDiscreteOrders } from '../state/twapDiscreteOrdersAtom'
import { TWAPOrderItem, TwapOrderInfo, TwapOrdersAuthResult } from '../types'

export function getTwapOrdersItems(
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  discreteOrders: TwapDiscreteOrders
): TWAPOrderItem[] {
  return ordersInfo.map(({ safeData, id }) => {
    return getTwapOrderItem(safeAddress, safeData, id, ordersAuthResult[id], discreteOrders[id])
  })
}

function getTwapOrderItem(
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  hash: string,
  authorized: boolean,
  discreteOrder: TwapDiscreteOrderItem | undefined
): TWAPOrderItem {
  const { params, submissionDate, isExecuted } = safeData

  const order = parseTwapOrderStruct(params.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, authorized, !!discreteOrder)

  return {
    order,
    status,
    safeAddress,
    hash,
    submissionDate,
  }
}
