jest.mock('common/favicon', () => {
  const mockPlay = jest.fn()

  class MockFaviconAnimator {
    play(_frames: string[], options?: { onComplete?: () => void }): void {
      mockPlay(_frames)
      options?.onComplete?.()
    }
    stop(): void {}
    resetToDefault(): void {}
    setDefaultFrame(): void {}
    isAnimationRunning(): boolean {
      return false
    }
  }

  return {
    FaviconAnimator: MockFaviconAnimator,
    frameDurations: {
      solving: 100,
      completed: 100,
      completedHold: 100,
      backToDefault: 100,
    },
    __mockPlay__: mockPlay,
  }
})

import { OrderProgressBarStepName } from 'modules/orderProgressBar'
import { OrderProgressBarState } from 'modules/orderProgressBar/types'

import { FaviconAnimationController } from './controller'

const { __mockPlay__: mockPlay } = jest.requireMock('common/favicon') as { __mockPlay__: jest.Mock }

describe('FaviconAnimationController', () => {
  const frameSet = {
    defaultFrame: 'default.ico',
    completedFrames: ['completed-1', 'completed-2'],
    completedHoldFrame: 'completed-hold',
    backToDefaultFrames: ['back-1'],
    solvingFrames: ['solving-1'],
  }

  const NOW = 10_000

  function successState(): OrderProgressBarState {
    return {
      progressBarStepName: OrderProgressBarStepName.FINISHED,
      lastTimeChangedSteps: NOW,
    }
  }

  function solvingState(): OrderProgressBarState {
    return {
      progressBarStepName: OrderProgressBarStepName.SOLVING,
      lastTimeChangedSteps: NOW,
      countdown: 5,
    }
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
    mockPlay.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function countCompletionPlays(): number {
    return mockPlay.mock.calls.filter(([frames]) => frames === frameSet.completedFrames).length
  }

  it('does not queue completion for already finished orders on first update', () => {
    const controller = new FaviconAnimationController(frameSet)

    controller.update({ orderA: successState() })

    expect(countCompletionPlays()).toBe(0)
  })

  it('only queues a completion animation once for the same finished state', () => {
    const controller = new FaviconAnimationController(frameSet)

    controller.update({ orderA: solvingState() })
    controller.update({ orderA: successState() })
    controller.update({}) // state pruned temporarily
    controller.update({ orderA: successState() }) // re-added while still success

    expect(countCompletionPlays()).toBe(1)
  })

  it('queues another completion when an order returns to solving and finishes again', () => {
    const controller = new FaviconAnimationController(frameSet)

    controller.update({ orderA: solvingState() })
    controller.update({ orderA: successState() })
    controller.update({ orderA: solvingState() })
    controller.update({ orderA: successState() })

    expect(countCompletionPlays()).toBe(2)
  })

  it('ignores completion animations triggered while another order is still in progress', () => {
    const controller = new FaviconAnimationController(frameSet)

    controller.update({ orderA: successState(), orderB: solvingState() })
    // Completing while another order is still solving should not enqueue anything.
    expect(countCompletionPlays()).toBe(0)

    controller.update({ orderB: successState() })

    expect(countCompletionPlays()).toBe(1)
  })
})
