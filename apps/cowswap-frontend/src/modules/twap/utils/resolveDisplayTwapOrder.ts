import { getTwapOrderStatus } from './getTwapOrderStatus'
import { getPrototypeTwapSimulationProgress, resolvePrototypeTwapExecution } from './resolvePrototypeTwapExecution'

import { TwapOrderItem, TwapOrderStatus } from '../types'

export function resolveDisplayTwapOrder(order: TwapOrderItem): TwapOrderItem {
  const resolvedExecutionDate = getResolvedExecutionDate(order)
  const resolvedExecutionInfo = resolvePrototypeTwapExecution(order)
  const resolvedStatus = getDisplayTwapOrderStatus({
    ...order,
    executedDate: resolvedExecutionDate,
    executionInfo: resolvedExecutionInfo,
  })

  if (
    resolvedStatus === order.status &&
    resolvedExecutionInfo === order.executionInfo &&
    resolvedExecutionDate === order.executedDate
  ) {
    return order
  }

  return {
    ...order,
    status: resolvedStatus,
    executedDate: resolvedExecutionDate,
    executionInfo: resolvedExecutionInfo,
  }
}

function getDisplayExecutionDate(order: TwapOrderItem): Date | null {
  const dateValue =
    order.executedDate || (order.status !== TwapOrderStatus.WaitSigning ? order.submissionDate : undefined)

  return dateValue ? new Date(dateValue) : null
}

function getDisplayTwapOrderStatus(order: TwapOrderItem): TwapOrderStatus {
  if (!order.isPrototype) return order.status

  if (order.status === TwapOrderStatus.Cancelling || order.status === TwapOrderStatus.Cancelled) {
    return order.status
  }

  const executionDate = getDisplayExecutionDate(order)

  return getTwapOrderStatus(
    order.order,
    order.status !== TwapOrderStatus.WaitSigning,
    executionDate,
    true,
    order.executionInfo,
  )
}

function getResolvedExecutionDate(order: TwapOrderItem): string | undefined {
  const simulationProgress = getPrototypeTwapSimulationProgress(order)

  if (!simulationProgress?.elapsedPartsCount) {
    return order.executedDate
  }

  const executionDateValue = order.executedDate || order.submissionDate
  const executionDate = new Date(executionDateValue)

  if (!Number.isFinite(executionDate.getTime())) {
    return order.executedDate
  }

  return new Date(executionDate.getTime() - simulationProgress.elapsedPartsCount * order.order.t * 1000).toISOString()
}
