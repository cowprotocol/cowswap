import { SwapAndBridgeStatus } from 'modules/bridge'

import { getProgressBarStepName, shouldApplyCompletionDrivenExecutingImmediately } from './useOrderProgressBarProps'

import { OrderProgressBarStepName } from '../constants'
import { OrderProgressBarState } from '../types'

const OPEN_STATUS = 'open' as OrderProgressBarState['backendApiStatus']
const EXECUTING_STATUS = 'executing' as OrderProgressBarState['backendApiStatus']
const TRADED_STATUS = 'traded' as OrderProgressBarState['backendApiStatus']

describe('getProgressBarStepName', () => {
  function callGetProgressBarStepName({
    isUnfillable = false,
    isConfirmed = false,
    countdown = null,
    currentStepName,
    backendApiStatus,
    previousStepName = OrderProgressBarStepName.SOLVING,
    previousBackendApiStatus,
    bridgingStatus,
    isBridgingTrade = false,
  }: {
    isUnfillable?: boolean
    isConfirmed?: boolean
    countdown?: OrderProgressBarState['countdown']
    currentStepName?: OrderProgressBarStepName | undefined
    backendApiStatus?: OrderProgressBarState['backendApiStatus']
    previousStepName?: OrderProgressBarStepName | undefined
    previousBackendApiStatus?: OrderProgressBarState['previousBackendApiStatus']
    bridgingStatus?: SwapAndBridgeStatus | undefined
    isBridgingTrade?: boolean
  }): OrderProgressBarStepName {
    return getProgressBarStepName(
      isUnfillable,
      false, // isCancelled
      false, // isExpired
      false, // isCancelling
      undefined, // cancellationTriggered
      isConfirmed,
      countdown,
      currentStepName,
      backendApiStatus,
      previousBackendApiStatus,
      previousStepName,
      bridgingStatus,
      isBridgingTrade,
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

  it('keeps step 2 after the order has already left the initial state once', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.SOLVING,
      backendApiStatus: OPEN_STATUS,
      previousStepName: undefined,
    })

    expect(result).toBe(OrderProgressBarStepName.DELAYED)
  })

  it('stays on step 1 while the order has not moved past the initial state yet', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.INITIAL,
      backendApiStatus: OPEN_STATUS,
      previousStepName: undefined,
    })

    expect(result).toBe(OrderProgressBarStepName.INITIAL)
  })

  it('stages executing before finishing when the order completes from step 2', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.SOLVING,
      previousStepName: OrderProgressBarStepName.INITIAL,
      isConfirmed: true,
    })

    expect(result).toBe(OrderProgressBarStepName.EXECUTING)
  })

  it('finishes once the executing step has already been shown', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.EXECUTING,
      previousStepName: OrderProgressBarStepName.SOLVING,
      isConfirmed: true,
    })

    expect(result).toBe(OrderProgressBarStepName.FINISHED)
  })

  it('restages executing after a submission retry path before finishing', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.SUBMISSION_FAILED,
      previousStepName: OrderProgressBarStepName.EXECUTING,
      isConfirmed: true,
    })

    expect(result).toBe(OrderProgressBarStepName.EXECUTING)
  })

  it('finishes after restaging executing for a submission retry path', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.EXECUTING,
      previousStepName: OrderProgressBarStepName.SUBMISSION_FAILED,
      isConfirmed: true,
    })

    expect(result).toBe(OrderProgressBarStepName.FINISHED)
  })

  it('stages executing before showing bridge progress when the swap completes instantly', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.SOLVING,
      previousStepName: OrderProgressBarStepName.INITIAL,
      bridgingStatus: SwapAndBridgeStatus.PENDING,
      isBridgingTrade: true,
    })

    expect(result).toBe(OrderProgressBarStepName.EXECUTING)
  })

  it('keeps bridge progress when bridge context temporarily disappears after fill', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
      previousStepName: OrderProgressBarStepName.EXECUTING,
      backendApiStatus: TRADED_STATUS,
      isBridgingTrade: true,
    })

    expect(result).toBe(OrderProgressBarStepName.BRIDGING_IN_PROGRESS)
  })

  it('keeps bridge completion when bridge context temporarily disappears after fill', () => {
    const result = callGetProgressBarStepName({
      currentStepName: OrderProgressBarStepName.BRIDGING_FINISHED,
      previousStepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
      backendApiStatus: TRADED_STATUS,
      isBridgingTrade: true,
    })

    expect(result).toBe(OrderProgressBarStepName.BRIDGING_FINISHED)
  })
})

describe('shouldApplyCompletionDrivenExecutingImmediately', () => {
  it('bypasses the 5s hold when executing is only a staging step before completion', () => {
    const result = shouldApplyCompletionDrivenExecutingImmediately(
      OrderProgressBarStepName.EXECUTING,
      OrderProgressBarStepName.SOLVING,
      OrderProgressBarStepName.INITIAL,
      true,
      undefined,
      undefined,
      false,
    )

    expect(result).toBe(true)
  })

  it('keeps the normal delay for a regular backend executing transition', () => {
    const result = shouldApplyCompletionDrivenExecutingImmediately(
      OrderProgressBarStepName.EXECUTING,
      OrderProgressBarStepName.SOLVING,
      OrderProgressBarStepName.INITIAL,
      false,
      EXECUTING_STATUS,
      undefined,
      false,
    )

    expect(result).toBe(false)
  })
})
