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

export function hasBlockingFillabilityIssue(fillability: OrderFillability | undefined): boolean {
  if (!fillability) {
    return false
  }

  const lacksBalance = fillability.hasEnoughBalance === false
  const lacksAllowance = fillability.hasEnoughAllowance === false && !fillability.hasPermit

  return lacksBalance || lacksAllowance
}

export function shouldShowUnfillableProgressStep(
  isUnfillable: boolean,
  fillability: OrderFillability | undefined,
): boolean {
  return isUnfillable && !hasBlockingFillabilityIssue(fillability)
}

export function computeUnfillableOrderIds(
  marketOrders: OrderLike[],
  pendingOrdersFillability: Record<string, OrderFillability | undefined>,
): string[] {
  // `Price change` should only reflect true price-derived unfillable states.
  // Temporary balance / allowance lag must keep the normal batching/searching flow.
  return marketOrders
    .filter((order) => shouldShowUnfillableProgressStep(!!order.isUnfillable, pendingOrdersFillability[order.id]))
    .map((order) => order.id)
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

export function hasProgressBarLeftInitialStep(currentStep: OrderProgressBarStepName | undefined): boolean {
  return !!currentStep && currentStep !== OrderProgressBarStepName.INITIAL
}

export function shouldStageExecutingStep(
  currentStep: OrderProgressBarStepName | undefined,
  nextStep: OrderProgressBarStepName | undefined,
  hasShownExecutingInCurrentAttempt?: boolean,
): boolean {
  // Never synthesize `INITIAL -> EXECUTING`; fast fills should still pass through the
  // competition/searching step. We only replay executing when the bar has already advanced
  // within the current backend attempt and step 3 has not yet been shown for that attempt.
  if (
    !currentStep ||
    currentStep === OrderProgressBarStepName.INITIAL ||
    currentStep === OrderProgressBarStepName.EXECUTING ||
    !isCompletionStep(nextStep) ||
    isCompletionStep(currentStep)
  ) {
    return false
  }

  return !hasShownExecutingInCurrentAttempt
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
