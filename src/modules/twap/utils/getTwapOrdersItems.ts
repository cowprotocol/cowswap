import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'
import { TwapDiscreteOrdersList } from '../state/twapDiscreteOrdersListAtom'
import { TWAPOrderItem, TwapOrderInfo } from '../types'

export function getTwapOrdersItems(
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  discreteOrders: TwapDiscreteOrdersList
): TWAPOrderItem[] {
  return ordersInfo.map(({ safeData, id }) => {
    return getTwapOrderItem(safeAddress, safeData, id, !!discreteOrders[id])
  })
}

function getTwapOrderItem(
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  hash: string,
  authorized: boolean
): TWAPOrderItem {
  const { params, submissionDate, isExecuted } = safeData

  const order = parseTwapOrderStruct(params.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, authorized)

  return {
    order,
    status,
    safeAddress,
    hash,
    submissionDate,
  }
}
