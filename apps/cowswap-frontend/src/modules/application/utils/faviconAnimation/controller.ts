import { OrderProgressBarState, OrderProgressBarStepName, OrdersProgressBarState } from 'modules/orderProgressBar/types'

import { FaviconAnimator, frameDurations, type FrameSet } from 'common/favicon'

import { isRecentStateChange, isSuccess, shouldAnimateInProgress } from './logic'

type AnimationMode = 'idle' | 'solving' | 'completing'

export class FaviconAnimationController {
  private readonly animator: FaviconAnimator
  private mode: AnimationMode = 'idle'
  private previousSteps: Record<string, OrderProgressBarStepName | undefined> = {}
  private completionQueue: string[] = []
  private currentCompletion: string | null = null
  private isInitialized = false
  private frameSet: FrameSet
  private completedOrders = new Set<string>()
  private hasInProgress = false

  constructor(frameSet: FrameSet) {
    this.frameSet = frameSet
    this.animator = new FaviconAnimator(frameSet.defaultFrame)
  }

  update(state: OrdersProgressBarState): void {
    const entries = Object.entries(state)
    const suppressQueue = !this.isInitialized
    const hasInProgress = entries.some(([, value]) => shouldAnimateInProgress(value))
    this.hasInProgress = hasInProgress
    this.enqueueCompleted(entries, suppressQueue)
    this.isInitialized = true
    if (hasInProgress) {
      this.handleInProgress()
      return
    }
    if (this.mode === 'completing') return
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
    this.previousSteps = {}
    this.completedOrders.clear()
    this.hasInProgress = false
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
      if (this.currentCompletion) this.unshiftCurrentCompletion()
      this.animator.stop()
      this.mode = 'idle'
      if (this.completionQueue.length) {
        this.startCompletionSequence()
        return
      }
      this.animator.resetToDefault()
      return
    }
    if (!this.animator.isAnimationRunning()) this.animator.resetToDefault()
  }

  private enqueueCompleted(entries: Array<[string, OrderProgressBarState]>, suppressQueue: boolean): void {
    const nextSteps: Record<string, OrderProgressBarStepName | undefined> = {}

    for (const [orderId, state] of entries) {
      const currentStep = state.progressBarStepName
      nextSteps[orderId] = currentStep

      this.updateCompletionCache(orderId, currentStep)
      this.tryQueueCompletion(orderId, state, currentStep, suppressQueue)
    }

    this.previousSteps = nextSteps
  }

  private updateCompletionCache(orderId: string, currentStep: OrderProgressBarStepName | undefined): void {
    if (!isSuccess(currentStep)) {
      this.completedOrders.delete(orderId)
    }
  }

  private tryQueueCompletion(
    orderId: string,
    state: OrderProgressBarState,
    currentStep: OrderProgressBarStepName | undefined,
    suppressQueue: boolean,
  ): void {
    if (
      suppressQueue ||
      !isSuccess(currentStep) ||
      this.completedOrders.has(orderId) ||
      this.previousSteps[orderId] === currentStep ||
      this.hasInProgress ||
      !isRecentStateChange(state)
    ) {
      return
    }

    if (!this.completionQueue.includes(orderId)) this.completionQueue.push(orderId)
    this.completedOrders.add(orderId)
  }

  private handleInProgress(): void {
    if (this.mode === 'completing' && this.currentCompletion) this.unshiftCurrentCompletion()
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
      if (!this.animator.isAnimationRunning()) this.animator.resetToDefault()
      return
    }
    this.mode = 'idle'
    this.currentCompletion = null
    this.animator.stop()
  }

  private unshiftCurrentCompletion(): void {
    if (!this.currentCompletion) return
    if (!this.completionQueue.includes(this.currentCompletion)) this.completionQueue.unshift(this.currentCompletion)
    this.currentCompletion = null
  }
}
