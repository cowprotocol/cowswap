import { useEffect, useState } from 'react'

import { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarStepName } from '../constants'

export const FINISHED_CONFIRMATION_HOLD_TIMEOUT_MS = ms`10s`

const CONFIRMATION_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.CANCELLATION_FAILED,
])

// Executed amounts stay "0" and the auction payload is still missing when the order first confirms.
// Stay on executing until both arrive, so the confirmation does not mount and then grow.
export function holdFinishedStep(
  stepName: OrderProgressBarStepName,
  order: Order | undefined,
  apiSolverCompetition: CompetitionOrderStatus['value'] | undefined,
): OrderProgressBarStepName {
  if (!CONFIRMATION_STEPS.has(stepName) || hasFinishedConfirmationData(order, apiSolverCompetition)) {
    return stepName
  }

  return OrderProgressBarStepName.EXECUTING
}

// A failed status lookup is returned as undefined, so a missing payload is indistinguishable from one still in flight.
// Give up after a bounded wait and open the confirmation rather than leaving the bar on executing.
export function useHoldFinishedStep(
  stepName: OrderProgressBarStepName,
  order: Order | undefined,
  apiSolverCompetition: CompetitionOrderStatus['value'] | undefined,
): OrderProgressBarStepName {
  const heldStepName = holdFinishedStep(stepName, order, apiSolverCompetition)
  const holding = heldStepName !== stepName
  const holdKey = holding ? `${order?.id ?? 'pending'}:${stepName}` : undefined
  const timedOut = useHoldTimedOut(holdKey)

  if (holding && !timedOut) return heldStepName

  return stepName
}

function hasFinishedConfirmationData(
  order: Order | undefined,
  apiSolverCompetition: CompetitionOrderStatus['value'] | undefined,
): boolean {
  const executedSellAmount = order?.apiAdditionalInfo?.executedSellAmount
  const executedBuyAmount = order?.apiAdditionalInfo?.executedBuyAmount

  return isNonZeroAmount(executedSellAmount) && isNonZeroAmount(executedBuyAmount) && apiSolverCompetition !== undefined
}

function isNonZeroAmount(amount: string | undefined): amount is string {
  return !!amount && amount !== '0'
}

function useHoldTimedOut(holdKey: string | undefined): boolean {
  const [trackedHoldKey, setTrackedHoldKey] = useState(holdKey)
  const [timedOut, setTimedOut] = useState(false)

  if (trackedHoldKey !== holdKey) {
    setTrackedHoldKey(holdKey)
    setTimedOut(false)
  }

  useEffect(() => {
    if (!holdKey) return

    const timer = setTimeout(() => setTimedOut(true), FINISHED_CONFIRMATION_HOLD_TIMEOUT_MS)

    return () => clearTimeout(timer)
  }, [holdKey])

  return timedOut && trackedHoldKey === holdKey
}
