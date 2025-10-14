import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { ordersProgressBarStateAtom } from 'modules/orderProgressBar/state/atoms'
import { OrderProgressBarState, OrderProgressBarStepName, OrdersProgressBarState } from 'modules/orderProgressBar/types'

import {
  FaviconAnimator,
  frameDurations,
  getCurrentFrameSet,
  subscribeToPreferredThemeChanges,
  type FrameSet,
} from 'common/favicon'

type AnimationMode = 'idle' | 'solving' | 'completing'

class FaviconAnimationController {
  private readonly animator: FaviconAnimator
  private mode: AnimationMode = 'idle'
  private previousSteps: Record<string, OrderProgressBarStepName | undefined> = {}
  private completionQueue: string[] = []
  private currentCompletion: string | null = null
  private isInitialized = false
  private frameSet: FrameSet

  constructor(frameSet: FrameSet) {
    this.frameSet = frameSet
    this.animator = new FaviconAnimator(frameSet.defaultFrame)
  }

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

  updateFrameSet(frameSet: FrameSet): void {
    this.frameSet = frameSet
    this.animator.setDefaultFrame(frameSet.defaultFrame)

    if (this.mode === 'solving') {
      if (!this.frameSet.solvingFrames.length) {
        this.mode = 'idle'
        this.animator.stop()
        return
      }

      this.animator.play(this.frameSet.solvingFrames, {
        loop: true,
        frameDuration: frameDurations.solving,
      })
      return
    }

    if (this.mode === 'completing') {
      if (this.currentCompletion) {
        this.completionQueue.unshift(this.currentCompletion)
        this.currentCompletion = null
      }

      this.animator.stop()
      this.mode = 'idle'

      if (this.completionQueue.length) {
        this.startCompletionSequence()
        return
      }

      this.animator.resetToDefault()
      return
    }

    if (!this.animator.isAnimationRunning()) {
      this.animator.resetToDefault()
    }
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

    if (!this.frameSet.solvingFrames.length) {
      this.mode = 'idle'
      this.animator.resetToDefault()
      return
    }

    if (this.mode !== 'solving') {
      this.animator.play(this.frameSet.solvingFrames, {
        loop: true,
        frameDuration: frameDurations.solving,
      })
      this.mode = 'solving'
    }
  }

  private startCompletionSequence(): void {
    if (!this.frameSet.completedFrames.length) {
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
    this.animator.play(this.frameSet.completedFrames, {
      frameDuration: frameDurations.completed,
      onComplete: () => this.playCompletionHold(),
    })
  }

  private playCompletionHold(): void {
    if (!this.frameSet.completedHoldFrame || frameDurations.completedHold <= 0) {
      this.playBackToDefault()
      return
    }

    this.animator.play([this.frameSet.completedHoldFrame], {
      frameDuration: frameDurations.completedHold,
      onComplete: () => this.playBackToDefault(),
    })
  }

  private playBackToDefault(): void {
    if (!this.frameSet.backToDefaultFrames.length) {
      this.finishCompletion()
      return
    }

    this.animator.play(this.frameSet.backToDefaultFrames, {
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

    const controller = new FaviconAnimationController(getCurrentFrameSet())
    controllerRef.current = controller

    const unsubscribe = subscribeToPreferredThemeChanges((_, frameSet) => {
      controller.updateFrameSet(frameSet)
    })

    return () => {
      unsubscribe()
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
  OrderProgressBarStepName.DELAYED,
])

const SUCCESS_STEPS = new Set<OrderProgressBarStepName>([
  OrderProgressBarStepName.FINISHED,
  OrderProgressBarStepName.BRIDGING_FINISHED,
])

const RECENT_STEP_THRESHOLD_MS = 1_800_000

function shouldAnimateInProgress(state: OrderProgressBarState): boolean {
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

  return hasActiveCountdown(state.countdown) || isRecentStateChange(state)
}

function isRecentStateChange(state: OrderProgressBarState): boolean {
  const { lastTimeChangedSteps, progressBarStepName } = state

  if (lastTimeChangedSteps == null) {
    return progressBarStepName === OrderProgressBarStepName.INITIAL
  }

  return Date.now() - lastTimeChangedSteps < RECENT_STEP_THRESHOLD_MS
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

function isSuccess(step: OrderProgressBarStepName | undefined): step is OrderProgressBarStepName {
  return step !== undefined && SUCCESS_STEPS.has(step)
}

export { shouldAnimateInProgress }
