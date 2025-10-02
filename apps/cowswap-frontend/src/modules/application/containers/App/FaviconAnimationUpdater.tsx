import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { ordersProgressBarStateAtom } from 'modules/orderProgressBar/state/atoms'
import { OrderProgressBarState, OrderProgressBarStepName, OrdersProgressBarState } from 'modules/orderProgressBar/types'

import {
  backToDefaultFrames,
  completedFrames,
  completedHoldFrame,
  defaultFrame,
  FaviconAnimator,
  frameDurations,
  solvingFrames,
} from 'common/favicon'

type AnimationMode = 'idle' | 'solving' | 'completing'

class FaviconAnimationController {
  private readonly animator = new FaviconAnimator(defaultFrame)
  private mode: AnimationMode = 'idle'
  private previousSteps: Record<string, OrderProgressBarStepName | undefined> = {}
  private completionQueue: string[] = []
  private currentCompletion: string | null = null
  private isInitialized = false

  update(state: OrdersProgressBarState): void {
    const entries = Object.entries(state)
    const suppressQueue = !this.isInitialized
    const hasInProgress = entries.some(([, value]) => shouldAnimateInProgress(value))

    this.enqueueCompleted(entries, suppressQueue)
    this.isInitialized = true

    if (hasInProgress) {
      this.handleInProgress()
      return
    }

    if (this.mode === 'completing') {
      return
    }

    if (this.completionQueue.length) {
      this.startCompletionSequence()
      return
    }

    this.resetToDefault()
  }

  dispose(): void {
    this.mode = 'idle'
    this.completionQueue = []
    this.currentCompletion = null
    this.isInitialized = false
    this.animator.stop()
  }

  private enqueueCompleted(entries: Array<[string, OrderProgressBarState]>, suppressQueue: boolean): void {
    const nextSteps: Record<string, OrderProgressBarStepName | undefined> = {}

    for (const [orderId, state] of entries) {
      const currentStep = state.progressBarStepName
      nextSteps[orderId] = currentStep

      if (
        !suppressQueue &&
        isSuccess(currentStep) &&
        this.previousSteps[orderId] !== currentStep &&
        isRecentStateChange(state)
      ) {
        if (!this.completionQueue.includes(orderId)) {
          this.completionQueue.push(orderId)
        }
      }
    }

    this.previousSteps = nextSteps
  }

  private handleInProgress(): void {
    if (this.mode === 'completing' && this.currentCompletion) {
      this.unshiftCurrentCompletion()
    }

    if (!solvingFrames.length) {
      this.mode = 'idle'
      this.animator.resetToDefault()
      return
    }

    if (this.mode !== 'solving') {
      this.animator.play(solvingFrames, {
        loop: true,
        frameDuration: frameDurations.solving,
      })
      this.mode = 'solving'
    }
  }

  private startCompletionSequence(): void {
    if (!completedFrames.length) {
      this.mode = 'idle'
      this.completionQueue = []
      this.animator.resetToDefault()
      return
    }

    this.currentCompletion = this.completionQueue.shift() ?? null

    if (!this.currentCompletion) {
      this.finishCompletion()
      return
    }

    this.mode = 'completing'
    this.animator.play(completedFrames, {
      frameDuration: frameDurations.completed,
      onComplete: () => this.playCompletionHold(),
    })
  }

  private playCompletionHold(): void {
    if (!completedHoldFrame || frameDurations.completedHold <= 0) {
      this.playBackToDefault()
      return
    }

    this.animator.play([completedHoldFrame], {
      frameDuration: frameDurations.completedHold,
      onComplete: () => this.playBackToDefault(),
    })
  }

  private playBackToDefault(): void {
    if (!backToDefaultFrames.length) {
      this.finishCompletion()
      return
    }

    this.animator.play(backToDefaultFrames, {
      frameDuration: frameDurations.backToDefault,
      onComplete: () => this.finishCompletion(),
    })
  }

  private finishCompletion(): void {
    this.currentCompletion = null

    if (this.completionQueue.length) {
      this.startCompletionSequence()
      return
    }

    this.mode = 'idle'
    this.animator.resetToDefault()
  }

  private resetToDefault(): void {
    if (this.mode === 'idle') {
      if (!this.animator.isAnimationRunning()) {
        this.animator.resetToDefault()
      }
      return
    }

    this.mode = 'idle'
    this.currentCompletion = null
    this.animator.stop()
  }

  private unshiftCurrentCompletion(): void {
    if (!this.currentCompletion) {
      return
    }

    if (!this.completionQueue.includes(this.currentCompletion)) {
      this.completionQueue.unshift(this.currentCompletion)
    }

    this.currentCompletion = null
  }
}

export function FaviconAnimationUpdater(): null {
  const ordersProgressState = useAtomValue(ordersProgressBarStateAtom)
  const controllerRef = useRef<FaviconAnimationController | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    controllerRef.current = new FaviconAnimationController()

    return () => {
      controllerRef.current?.dispose()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.update(ordersProgressState)
  }, [ordersProgressState])

  return null
}

const SOLVING_ANIMATION_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.SOLVING,
  OrderProgressBarStepName.SOLVED,
  OrderProgressBarStepName.EXECUTING,
  OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
])

const SUCCESS_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.BRIDGING_FINISHED,
])

const RECENT_STEP_THRESHOLD_MS = 1_800_000

function shouldAnimateInProgress(state: OrderProgressBarState): boolean {
  const step = state.progressBarStepName
  const countdownActive = hasActiveCountdown(state.countdown)

  if (!step) {
    return false
  }

  if (step === OrderProgressBarStepName.INITIAL) {
    if (isSuccess(state.previousStepName)) {
      return false
    }

    if (!state.backendApiStatus) {
      return false
    }

    if (!countdownActive && !state.lastTimeChangedSteps) {
      return false
    }

    return countdownActive || isRecentStateChange(state)
  }

  if (!SOLVING_ANIMATION_STEPS.has(step)) {
    return false
  }

  return countdownActive || isRecentStateChange(state)
}

function isRecentStateChange(state: OrderProgressBarState): boolean {
  if (!state.lastTimeChangedSteps) {
    return true
  }

  return Date.now() - state.lastTimeChangedSteps < RECENT_STEP_THRESHOLD_MS
}

function hasActiveCountdown(countdown: OrderProgressBarState['countdown']): boolean {
  return typeof countdown === 'number' && countdown > 0
}

function isSuccess(step: OrderProgressBarStepName | undefined): step is OrderProgressBarStepName {
  return step !== undefined && SUCCESS_STEPS.has(step)
}
