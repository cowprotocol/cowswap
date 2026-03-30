import { getPrototypeTwapExecution } from './buildPrototypeTwapOrderItem'

import { TwapOrderItem, TwapOrderStatus, TwapOrdersExecution } from '../types'

export interface PrototypeTwapSimulationProgress {
  confirmedPartsCount: number
  elapsedPartsCount: number
}

export function getPrototypeTwapSimulationProgress(
  order: TwapOrderItem,
  nowMs = Date.now(),
): PrototypeTwapSimulationProgress | null {
  if (!isPrototypeSimulationActive(order)) {
    return null
  }

  const startMs = getPrototypeSimulationStartMs(order)

  if (startMs === null) {
    return null
  }

  const simulation = order.prototypeSimulation

  if (!simulation) {
    return null
  }

  const elapsedMs = Math.max(0, nowMs - startMs)
  const progressedPartsCount = Math.floor(elapsedMs / simulation.partProgressMs)
  const maxConfirmedParts = simulation.maxConfirmedParts ?? order.order.n

  return {
    confirmedPartsCount: Math.max(
      order.executionInfo.confirmedPartsCount,
      Math.min(order.order.n, maxConfirmedParts, progressedPartsCount),
    ),
    elapsedPartsCount: Math.min(order.order.n, progressedPartsCount),
  }
}

export function resolvePrototypeTwapExecution(order: TwapOrderItem, nowMs = Date.now()): TwapOrdersExecution {
  const progress = getPrototypeTwapSimulationProgress(order, nowMs)

  if (!progress || progress.confirmedPartsCount === order.executionInfo.confirmedPartsCount) {
    return order.executionInfo
  }

  return getPrototypeTwapExecution(order.order, order.status, progress.confirmedPartsCount)
}

function getPrototypeSimulationStartMs(order: TwapOrderItem): number | null {
  const startMs = new Date(order.executedDate || order.submissionDate).getTime()

  return Number.isFinite(startMs) ? startMs : null
}

function isPrototypeSimulationActive(order: TwapOrderItem): boolean {
  return (
    !!order.isPrototype &&
    !!order.prototypeSimulation?.partProgressMs &&
    order.status !== TwapOrderStatus.WaitSigning &&
    order.status !== TwapOrderStatus.Cancelling &&
    order.status !== TwapOrderStatus.Cancelled
  )
}
