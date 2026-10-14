import { deriveTwapStatus, type ProgrammaticOrderStatus } from '@cowprotocol/sdk-composable'

import { mapTwapStatus } from './mapTwapStatus'

import { TwapOrdersExecution, TwapOrderStatus, TWAPOrderStruct } from '../types'

interface GetTwapOrderStatusParams {
  order: TWAPOrderStruct
  execution: TwapOrdersExecution
  executionDate: Date | null
  isCancelled: boolean
  isWaitingForSignature: boolean
}

export function getTwapOrderStatus(params: GetTwapOrderStatusParams): TwapOrderStatus {
  const {
    order,
    execution: { confirmedPartsCount, info: executionInfo },
    executionDate,
    isCancelled,
    isWaitingForSignature,
  } = params

  const now = Math.ceil(Date.now() / 1000)
  const effectiveStartTime = order.t0 || Math.ceil((executionDate?.getTime() ?? now * 1000) / 1000)
  const status = getProgrammaticOrderStatus(isCancelled, confirmedPartsCount === order.n)
  const executionStatus = deriveTwapStatus({
    lifecycleStatus: status,
    executedAmounts: { executedSellAmount: BigInt(executionInfo.executedSellAmount) },
    schedule: {
      partSellAmount: BigInt(order.partSellAmount),
      numberOfParts: order.n,
      effectiveStartTime,
      timeBetweenParts: order.t,
    },
  })

  return executionStatus === 'open' && isWaitingForSignature
    ? TwapOrderStatus.WaitSigning
    : mapTwapStatus(executionStatus)
}

export function isTwapOrderExpired(order: TWAPOrderStruct, startDate: Date | null): boolean {
  if (!order.t0 && !startDate) return false

  const startTime = order.t0 || Math.ceil((startDate?.getTime() || 0) / 1000)
  const { n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}

function getProgrammaticOrderStatus(isCancelled: boolean, isCompleted: boolean): ProgrammaticOrderStatus {
  if (isCancelled) return 'Cancelled'
  if (isCompleted) return 'Completed'
  return 'Active'
}
