jest.mock('common/favicon', () => {
  const frameSet = {
    defaultFrame: 'default.ico',
    completedFrames: [],
    completedHoldFrame: null,
    backToDefaultFrames: [],
    solvingFrames: [],
  }

  return {
    FaviconAnimator: class {
      play(): void {}
      stop(): void {}
      resetToDefault(): void {}
      setDefaultFrame(): void {}
      isAnimationRunning(): boolean {
        return false
      }
    },
    frameDurations: {
      solving: 100,
      completed: 100,
      completedHold: 0,
      backToDefault: 100,
    },
    getCurrentFrameSet: () => frameSet,
    subscribeToPreferredThemeChanges: jest.fn(() => () => {}),
  }
})

import { shouldAnimateInProgress } from 'modules/application/utils/faviconAnimation/logic'
import { OrderProgressBarStepName } from 'modules/orderProgressBar'
import { OrderProgressBarState } from 'modules/orderProgressBar/types'

describe('FaviconAnimationUpdater – shouldAnimateInProgress', () => {
  const NOW = 1_000_000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  function makeState(partial: Partial<OrderProgressBarState>): OrderProgressBarState {
    return {
      countdown: null,
      progressBarStepName: OrderProgressBarStepName.INITIAL,
      ...partial,
    }
  }

  it('animates while solving when a countdown is active', () => {
    const state = makeState({
      progressBarStepName: OrderProgressBarStepName.SOLVING,
      countdown: 25,
    })

    expect(shouldAnimateInProgress(state)).toBe(true)
  })

  it('animates for delayed orders when the state change is recent', () => {
    const state = makeState({
      progressBarStepName: OrderProgressBarStepName.DELAYED,
      lastTimeChangedSteps: NOW - 1_000,
    })

    expect(shouldAnimateInProgress(state)).toBe(true)
  })

  it('stops animating once the order is expired, even if the change was recent', () => {
    const state = makeState({
      progressBarStepName: OrderProgressBarStepName.EXPIRED,
      lastTimeChangedSteps: NOW - 500,
    })

    expect(shouldAnimateInProgress(state)).toBe(false)
  })
})
