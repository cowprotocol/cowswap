import { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { Order } from 'legacy/state/orders/actions'

import { FINISHED_CONFIRMATION_HOLD_TIMEOUT_MS, holdFinishedStep, useHoldFinishedStep } from './useHoldFinishedStep'

import { OrderProgressBarStepName } from '../constants'

const competition = [] as NonNullable<CompetitionOrderStatus['value']>

function filledOrder(executedSellAmount = '2', executedBuyAmount = '1'): Order {
  return {
    id: 'order-1',
    apiAdditionalInfo: { executedSellAmount, executedBuyAmount },
  } as Order
}

describe('holdFinishedStep', () => {
  it('stays on executing until executed amounts and the solver competition have both arrived', () => {
    expect(holdFinishedStep(OrderProgressBarStepName.FINISHED, undefined, competition)).toBe(
      OrderProgressBarStepName.EXECUTING,
    )
    expect(holdFinishedStep(OrderProgressBarStepName.FINISHED, filledOrder('0', '0'), competition)).toBe(
      OrderProgressBarStepName.EXECUTING,
    )
    expect(holdFinishedStep(OrderProgressBarStepName.FINISHED, filledOrder(), undefined)).toBe(
      OrderProgressBarStepName.EXECUTING,
    )
    expect(holdFinishedStep(OrderProgressBarStepName.CANCELLATION_FAILED, filledOrder(), undefined)).toBe(
      OrderProgressBarStepName.EXECUTING,
    )
  })

  it('enters the confirmation once both payloads are present', () => {
    expect(holdFinishedStep(OrderProgressBarStepName.FINISHED, filledOrder(), competition)).toBe(
      OrderProgressBarStepName.FINISHED,
    )
    expect(holdFinishedStep(OrderProgressBarStepName.CANCELLATION_FAILED, filledOrder(), competition)).toBe(
      OrderProgressBarStepName.CANCELLATION_FAILED,
    )
  })

  it('leaves in-progress steps unchanged', () => {
    expect(holdFinishedStep(OrderProgressBarStepName.SOLVING, undefined, undefined)).toBe(
      OrderProgressBarStepName.SOLVING,
    )
  })
})

describe('useHoldFinishedStep', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('opens the confirmation when the competition never arrives', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() =>
      useHoldFinishedStep(OrderProgressBarStepName.FINISHED, filledOrder(), undefined),
    )

    expect(result.current).toBe(OrderProgressBarStepName.EXECUTING)

    act(() => {
      jest.advanceTimersByTime(FINISHED_CONFIRMATION_HOLD_TIMEOUT_MS)
    })

    expect(result.current).toBe(OrderProgressBarStepName.FINISHED)
  })

  it('opens the confirmation immediately once the competition arrives', () => {
    jest.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ solvers }: { solvers: CompetitionOrderStatus['value'] | undefined }) =>
        useHoldFinishedStep(OrderProgressBarStepName.FINISHED, filledOrder(), solvers),
      { initialProps: { solvers: undefined } },
    )

    expect(result.current).toBe(OrderProgressBarStepName.EXECUTING)

    rerender({ solvers: competition })

    expect(result.current).toBe(OrderProgressBarStepName.FINISHED)
  })

  it('does not advance an in-progress step when the wait elapses', () => {
    jest.useFakeTimers()
    const { result } = renderHook(() => useHoldFinishedStep(OrderProgressBarStepName.SOLVING, filledOrder(), undefined))

    act(() => {
      jest.advanceTimersByTime(FINISHED_CONFIRMATION_HOLD_TIMEOUT_MS)
    })

    expect(result.current).toBe(OrderProgressBarStepName.SOLVING)
  })
})
