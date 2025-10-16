import { OrderProgressBarState, OrderProgressBarStepName } from 'modules/orderProgressBar/types'

const SOLVING_ANIMATION_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.SOLVING,
  OrderProgressBarStepName.SOLVED,
  OrderProgressBarStepName.EXECUTING,
  OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
  OrderProgressBarStepName.DELAYED,
])

const SUCCESS_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.BRIDGING_FINISHED,
])

const RECENT_STEP_THRESHOLD_MS = 1_800_000

export function shouldAnimateInProgress(state: OrderProgressBarState): boolean {
  const step = state.progressBarStepName

  if (!step) {
    return false
  }

  if (step === OrderProgressBarStepName.INITIAL) {
    return shouldAnimateInitialStep(state)
  }

  if (!SOLVING_ANIMATION_STEPS.has(step)) {
    return false
  }

  if (step === OrderProgressBarStepName.DELAYED) {
    return true
  }

  return hasActiveCountdown(state.countdown) || isRecentStateChange(state)
}

export function isRecentStateChange(state: OrderProgressBarState): boolean {
  const { lastTimeChangedSteps, progressBarStepName } = state

  if (lastTimeChangedSteps == null) {
    return progressBarStepName === OrderProgressBarStepName.INITIAL
  }

  return Date.now() - lastTimeChangedSteps < RECENT_STEP_THRESHOLD_MS
}

export function isSuccess(step: OrderProgressBarStepName | undefined): step is OrderProgressBarStepName {
  return step !== undefined && SUCCESS_STEPS.has(step)
}

function shouldAnimateInitialStep(state: OrderProgressBarState): boolean {
  if (isSuccess(state.previousStepName)) {
    return false
  }

  if (!state.backendApiStatus) {
    return false
  }

  const countdownActive = hasActiveCountdown(state.countdown)

  if (!countdownActive && !state.lastTimeChangedSteps) {
    return false
  }

  return countdownActive || isRecentStateChange(state)
}

function hasActiveCountdown(countdown: OrderProgressBarState['countdown']): boolean {
  return typeof countdown === 'number' && countdown > 0
}
