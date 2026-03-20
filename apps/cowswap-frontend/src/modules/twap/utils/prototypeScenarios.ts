import ms from 'ms.macro'

import { DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS } from '../const'
import { TwapOrderStatus, TwapPrototypeOrderParams, TwapPrototypeScenario } from '../types'

interface BuildPrototypeScenarioParams {
  baseNow: number
  numOfParts: number
  timeInterval: number
}

export const DEFAULT_TWAP_PROTOTYPE_SEED_SCENARIOS: readonly TwapPrototypeScenario[] = [
  TwapPrototypeScenario.StaticOpen,
  TwapPrototypeScenario.AutoProgressOpen,
  TwapPrototypeScenario.Cancelling,
  TwapPrototypeScenario.Cancelled,
  TwapPrototypeScenario.Expired,
  TwapPrototypeScenario.Fulfilled,
  TwapPrototypeScenario.PartiallyExpired,
] as const

export const MANUAL_TWAP_PROTOTYPE_SCENARIOS: readonly TwapPrototypeScenario[] = [
  TwapPrototypeScenario.StaticOpen,
  TwapPrototypeScenario.AutoProgressOpen,
  TwapPrototypeScenario.Cancelling,
  TwapPrototypeScenario.Cancelled,
  TwapPrototypeScenario.PartiallyCancelled,
  TwapPrototypeScenario.Expired,
  TwapPrototypeScenario.PartiallyExpired,
  TwapPrototypeScenario.Fulfilled,
] as const

export function buildPrototypeScenarioOrderParams(
  scenario: TwapPrototypeScenario,
  params: BuildPrototypeScenarioParams,
): TwapPrototypeOrderParams {
  const { baseNow, numOfParts, timeInterval } = params
  const partialConfirmedParts = numOfParts > 1 ? Math.min(numOfParts - 1, 1) : 0
  const cancelledConfirmedParts = Math.max(1, Math.min(numOfParts - 1, 3))
  const openProgressCap = Math.max(1, Math.min(numOfParts - 1, 2))
  const totalDurationMs = numOfParts * timeInterval * 1000
  const cancellingElapsedMs = Math.max(ms`6 minutes`, Math.min(ms`30 minutes`, Math.floor(totalDurationMs / 3)))

  switch (scenario) {
    case TwapPrototypeScenario.AutoProgressOpen:
      return {
        status: TwapOrderStatus.Pending,
        submissionDate: new Date(baseNow - ms`2 minutes`).toISOString(),
        executedDate: new Date(baseNow - ms`90 seconds`).toISOString(),
        createPartOrders: true,
        prototypeSimulation: {
          partProgressMs: DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS,
          maxConfirmedParts: openProgressCap,
        },
      }
    case TwapPrototypeScenario.StaticOpen:
      return {
        status: TwapOrderStatus.Pending,
        submissionDate: new Date(baseNow - ms`45 minutes`).toISOString(),
        executedDate: new Date(baseNow - ms`44 minutes`).toISOString(),
        createPartOrders: true,
        prototypeSimulation: { partProgressMs: 0 },
      }
    case TwapPrototypeScenario.Cancelling:
      return {
        status: TwapOrderStatus.Cancelling,
        submissionDate: new Date(baseNow - cancellingElapsedMs - ms`1 minute`).toISOString(),
        executedDate: new Date(baseNow - cancellingElapsedMs).toISOString(),
        createPartOrders: true,
      }
    case TwapPrototypeScenario.Cancelled:
      return {
        status: TwapOrderStatus.Cancelled,
        submissionDate: new Date(baseNow - ms`8 hours`).toISOString(),
        executedDate: new Date(baseNow - ms`479 minutes`).toISOString(),
        createPartOrders: true,
      }
    case TwapPrototypeScenario.PartiallyCancelled:
      return {
        status: TwapOrderStatus.Cancelled,
        submissionDate: new Date(baseNow - ms`10 hours`).toISOString(),
        executedDate: new Date(baseNow - ms`599 minutes`).toISOString(),
        confirmedPartsCount: cancelledConfirmedParts,
        createPartOrders: true,
      }
    case TwapPrototypeScenario.Expired:
      return {
        status: TwapOrderStatus.Expired,
        submissionDate: new Date(baseNow - ms`36 hours`).toISOString(),
        executedDate: new Date(baseNow - ms`35 hours`).toISOString(),
        createPartOrders: true,
      }
    case TwapPrototypeScenario.PartiallyExpired:
      return {
        status: TwapOrderStatus.Expired,
        submissionDate: new Date(baseNow - totalDurationMs - ms`2 minutes`).toISOString(),
        executedDate: new Date(baseNow - totalDurationMs - ms`90 seconds`).toISOString(),
        confirmedPartsCount: partialConfirmedParts,
        createPartOrders: true,
      }
    case TwapPrototypeScenario.Fulfilled:
      return {
        status: TwapOrderStatus.Fulfilled,
        submissionDate: new Date(baseNow - ms`12 hours`).toISOString(),
        executedDate: new Date(baseNow - ms`719 minutes`).toISOString(),
        confirmedPartsCount: numOfParts,
        createPartOrders: true,
      }
  }
}
