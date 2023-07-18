import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getTwapOrderStatus } from './getTwapOrderStatus'
import { parseTwapOrderStruct } from './parseTwapOrderStruct'

import { TwapOrdersExecution, TwapOrdersExecutionMap } from '../hooks/useTwapOrdersExecutions'
import { TwapOrdersList } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderInfo, TwapOrdersAuthResult, TwapOrdersSafeData } from '../types'

export function buildTwapOrdersItems(
  chainId: SupportedChainId,
  safeAddress: string,
  ordersInfo: TwapOrderInfo[],
  ordersAuthResult: TwapOrdersAuthResult,
  twapOrderExecutions: TwapOrdersExecutionMap
): TwapOrdersList {
  return ordersInfo.reduce<TwapOrdersList>((acc, { safeData, id }) => {
    acc[id] = getTwapOrderItem(chainId, safeAddress, safeData, id, ordersAuthResult[id], twapOrderExecutions[id])
    return acc
  }, {})
}

function getTwapOrderItem(
  chainId: SupportedChainId,
  safeAddress: string,
  safeData: TwapOrdersSafeData,
  id: string,
  authorized: boolean | undefined,
  executionInfo: TwapOrdersExecution
): TwapOrderItem {
  const { conditionalOrderParams, safeTxParams } = safeData
  const { isExecuted, submissionDate, executionDate: _executionDate } = safeTxParams

  const executionDate = _executionDate ? new Date(_executionDate) : null
  const order = parseTwapOrderStruct(conditionalOrderParams.staticInput)
  const status = getTwapOrderStatus(order, isExecuted, executionDate, authorized, executionInfo)

  return {
    order,
    status,
    chainId,
    safeAddress,
    id,
    submissionDate,
    executedDate: _executionDate || undefined,
    safeTxParams,
    executionInfo,
  }
}
