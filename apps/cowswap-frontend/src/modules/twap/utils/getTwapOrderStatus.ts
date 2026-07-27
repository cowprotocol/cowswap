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

  const isFulfilled = isTwapOrderFulfilled(order, executionInfo.executedSellAmount)
  const isCompleted = confirmedPartsCount === order.n
  const isExpired = isCompleted || isTwapOrderExpired(order, executionDate)

  if (isFulfilled) return TwapOrderStatus.Fulfilled
  if (isCancelled) return TwapOrderStatus.Cancelled
  if (isExpired) return TwapOrderStatus.Expired
  if (isWaitingForSignature) return TwapOrderStatus.WaitSigning

  return TwapOrderStatus.Pending
}

export function isTwapOrderExpired(order: TWAPOrderStruct, startDate: Date | null): boolean {
  if (!order.t0 && !startDate) return false

  const startTime = order.t0 || Math.ceil((startDate?.getTime() || 0) / 1000)
  const { n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}

function isTwapOrderFulfilled(order: TWAPOrderStruct, executedSellAmount: string): boolean {
  return executedSellAmount === (BigInt(order.partSellAmount) * BigInt(order.n)).toString()
}
