import {
  getCompletionDelayMs,
  MINIMUM_STEP_DISPLAY_TIME,
  OrderProgressBarStepName,
  shouldApplyStepNameImmediately,
} from 'modules/orderProgressBar'

import type { ScenarioFrame } from './OrderProgressBarPlayground.demo.constants'

function isCompletionDrivenExecutingFrame(frame: ScenarioFrame): boolean {
  return frame.stepName === OrderProgressBarStepName.EXECUTING && frame.backendStatus.includes('traded')
}

export function getScenarioFrameDelayMs(currentFrame: ScenarioFrame, nextFrame: ScenarioFrame): number {
  const backendDelayMs = currentFrame.holdMs

  if (currentFrame.stepName === nextFrame.stepName) {
    return backendDelayMs
  }

  if (isCompletionDrivenExecutingFrame(nextFrame)) {
    return backendDelayMs
  }

  const remainingCompletionDelayMs = getCompletionDelayMs(currentFrame.stepName, nextFrame.stepName, 0, backendDelayMs)

  if (remainingCompletionDelayMs > 0) {
    return backendDelayMs + remainingCompletionDelayMs
  }

  if (shouldApplyStepNameImmediately(0, backendDelayMs, nextFrame.stepName)) {
    return backendDelayMs
  }

  return Math.max(backendDelayMs, MINIMUM_STEP_DISPLAY_TIME)
}

export function getScenarioFrameCountdown(frame: ScenarioFrame, elapsedMs: number): number | null | undefined {
  if (frame.countdown == null) {
    return frame.countdown
  }

  return Math.max(frame.countdown - Math.floor(elapsedMs / 1000), 0)
}
