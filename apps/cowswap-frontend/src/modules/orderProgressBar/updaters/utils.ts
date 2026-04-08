import { type OrderFillability } from 'modules/ordersTable'

import { OrderProgressBarStepName } from '../constants'

type OrderLike = {
  id: string
  isUnfillable?: boolean
}

const COMPLETION_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
  OrderProgressBarStepName.BRIDGING_FAILED,
  OrderProgressBarStepName.REFUND_COMPLETED,
  OrderProgressBarStepName.BRIDGING_FINISHED,
])

export const EXECUTING_STEP_MIN_DISPLAY_TIME_MS = 1000

export function computeUnfillableOrderIds(
  marketOrders: OrderLike[],
  pendingOrdersFillability: Record<string, OrderFillability | undefined>,
): string[] {
  // `isUnfillable` is toggled on the client (see UnfillableOrdersUpdater and OrdersTableList) after comparing quotes and allowances.
  const priceDerived = marketOrders.filter((order) => order.isUnfillable).map((order) => order.id)

  const fillabilityDerived = Object.entries(pendingOrdersFillability).reduce<string[]>(
    (acc, [orderId, fillability]) => {
      if (!fillability) {
        return acc
      }

      const lacksBalance = fillability.hasEnoughBalance === false
      const lacksAllowance = fillability.hasEnoughAllowance === false && !fillability.hasPermit

      if (lacksBalance || lacksAllowance) {
        acc.push(orderId)
      }

      return acc
    },
    [],
  )

  // An order can be flagged by both mechanisms; the Set keeps the list unique.
  return Array.from(new Set([...priceDerived, ...fillabilityDerived]))
}

export function getNewlyFillableOrderIds(previous: Iterable<string>, current: Iterable<string>): string[] {
  const currentSet = new Set(current)
  const newlyFillable: string[] = []

  for (const orderId of previous) {
    if (!currentSet.has(orderId)) {
      newlyFillable.push(orderId)
    }
  }

  return newlyFillable
}

export function isCompletionStep(step: OrderProgressBarStepName | undefined): step is OrderProgressBarStepName {
  return !!step && COMPLETION_STEPS.has(step)
}

export function shouldStageExecutingStep(
  currentStep: OrderProgressBarStepName | undefined,
  previousStep: OrderProgressBarStepName | undefined,
  nextStep: OrderProgressBarStepName | undefined,
): boolean {
  if (
    !currentStep ||
    currentStep === OrderProgressBarStepName.INITIAL ||
    !isCompletionStep(nextStep) ||
    isCompletionStep(currentStep)
  ) {
    return false
  }

  return currentStep !== OrderProgressBarStepName.EXECUTING && previousStep !== OrderProgressBarStepName.EXECUTING
}

export function getCompletionDelayMs(
  currentStep: OrderProgressBarStepName | undefined,
  nextStep: OrderProgressBarStepName | undefined,
  lastTimeChangedSteps: number | undefined,
  now = Date.now(),
): number {
  if (
    currentStep !== OrderProgressBarStepName.EXECUTING ||
    !isCompletionStep(nextStep) ||
    lastTimeChangedSteps == null
  ) {
    return 0
  }

  return Math.max(EXECUTING_STEP_MIN_DISPLAY_TIME_MS - (now - lastTimeChangedSteps), 0)
}
