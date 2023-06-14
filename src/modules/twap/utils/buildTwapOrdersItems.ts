import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'

import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { TwapToDiscreteOrders } from '../hooks/useTwapDiscreteOrders'
import { TwapOrdersSafeData } from '../services/fetchTwapOrdersFromSafe'
import { TwapOrdersList } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderInfo, TwapOrdersAuthResult } from '../types'

export function buildTwapOrdersItems(
  chainId: SupportedChainId,
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  discreteOrders: TwapToDiscreteOrders
): TwapOrdersList {
  return ordersInfo.reduce<TwapOrdersList>((acc, { safeData, id }) => {
    acc[id] = getTwapOrderItem(chainId, safeAddress, safeData, id, ordersAuthResult[id], discreteOrders[id])
    return acc
  }, {})
}

function getTwapOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  id: string,
  authorized: boolean | undefined,
  discreteOrder: Order | undefined
): TwapOrderItem {
  const { params, isExecuted, submissionDate } = safeData

  const executionDate = new Date(safeData.executionDate)
  const order = parseTwapOrderStruct(params.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, executionDate, authorized, discreteOrder)

  return {
    order,
    status,
    chainId,
    safeAddress,
    id,
    submissionDate,
  }
}
