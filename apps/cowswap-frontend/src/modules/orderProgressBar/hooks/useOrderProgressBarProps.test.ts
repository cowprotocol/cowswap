import { getProgressBarStepName, shouldUpdateStepImmediately } from './useOrderProgressBarProps'

import { OrderProgressBarStepName } from '../constants'
import { OrderProgressBarState } from '../types'

const OPEN_STATUS = 'open' as OrderProgressBarState['backendApiStatus']
const EXECUTING_STATUS = 'executing' as OrderProgressBarState['backendApiStatus']

describe('getProgressBarStepName', () => {
  function callGetProgressBarStepName({
    isUnfillable = false,
    backendApiStatus,
    previousStepName = OrderProgressBarStepName.SOLVING,
    previousBackendApiStatus,
  }: {
    isUnfillable?: boolean
    backendApiStatus?: OrderProgressBarState['backendApiStatus']
    previousStepName?: OrderProgressBarStepName | undefined
    previousBackendApiStatus?: OrderProgressBarState['previousBackendApiStatus']
  }): OrderProgressBarStepName {
    return getProgressBarStepName(
      isUnfillable,
      false, // isCancelled
      false, // isExpired
      false, // isCancelling
      undefined, // cancellationTriggered
      false, // isConfirmed
      null, // countdown
      backendApiStatus,
      previousBackendApiStatus,
      previousStepName,
      undefined, // bridgingStatus
      false, // isBridgingTrade
    )
  }

  it('keeps the solving animation when an order recovers from unfillable without backend status', () => {
    const result = callGetProgressBarStepName({
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
    })

    expect(result).toBe(OrderProgressBarStepName.SOLVING)
  })

  it('keeps the solving animation when backend status is open after an unfillable recovery', () => {
    const result = callGetProgressBarStepName({
      backendApiStatus: OPEN_STATUS,
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
    })

    expect(result).toBe(OrderProgressBarStepName.SOLVING)
  })

  it('still transitions to executing when the backend reports progress', () => {
    const result = callGetProgressBarStepName({
      backendApiStatus: EXECUTING_STATUS,
      previousStepName: OrderProgressBarStepName.UNFILLABLE,
      previousBackendApiStatus: OPEN_STATUS,
    })

    expect(result).toBe(OrderProgressBarStepName.EXECUTING)
  })
})

describe('shouldUpdateStepImmediately', () => {
  const MINIMUM_STEP_DISPLAY_TIME = 5000 // ms`5s`
  const RECENT_CHANGE = 1000 // less than MINIMUM_STEP_DISPLAY_TIME

  it('bypasses the debounce for cancellation and terminal steps even when the last change is recent', () => {
    const immediateSteps = [
      OrderProgressBarStepName.CANCELLING,
      OrderProgressBarStepName.CANCELLED,
      OrderProgressBarStepName.CANCELLATION_FAILED,
      OrderProgressBarStepName.EXPIRED,
      OrderProgressBarStepName.FINISHED,
    ]

    immediateSteps.forEach((stepName) => {
      expect(shouldUpdateStepImmediately(stepName, Date.now(), RECENT_CHANGE)).toBe(true)
    })
  })

  it('debounces a normal step when the previous step was shown less than the minimum display time ago', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, Date.now(), RECENT_CHANGE)).toBe(false)
  })

  it('shows a normal step immediately once the minimum display time has elapsed', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, Date.now(), MINIMUM_STEP_DISPLAY_TIME)).toBe(
      true,
    )
  })

  it('shows the first step immediately when there is no previous change timestamp', () => {
    expect(shouldUpdateStepImmediately(OrderProgressBarStepName.SOLVING, undefined, 0)).toBe(true)
  })
})
