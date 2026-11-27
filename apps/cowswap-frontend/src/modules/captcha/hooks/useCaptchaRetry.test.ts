import { renderHook } from '@testing-library/react'

import { useCaptchaRetry } from './useCaptchaRetry'

describe('useCaptchaRetry', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('doubles the delay from 1s and caps it at 30s', () => {
    const retry = jest.fn()
    const { result } = renderHook(() => useCaptchaRetry())

    ;[1000, 2000, 4000, 8000, 16000, 30000, 30000].forEach((delay, index) => {
      result.current.scheduleRetry(retry)
      jest.advanceTimersByTime(delay - 1)
      expect(retry).toHaveBeenCalledTimes(index)
      jest.advanceTimersByTime(1)
      expect(retry).toHaveBeenCalledTimes(index + 1)
    })
  })

  it('resetRetries cancels the pending retry and starts again from 1s', () => {
    const retry = jest.fn()
    const { result } = renderHook(() => useCaptchaRetry())

    result.current.scheduleRetry(retry)
    jest.advanceTimersByTime(1000)
    result.current.scheduleRetry(retry)
    result.current.resetRetries()
    jest.advanceTimersByTime(2000)
    expect(retry).toHaveBeenCalledTimes(1)

    result.current.scheduleRetry(retry)
    jest.advanceTimersByTime(1000)
    expect(retry).toHaveBeenCalledTimes(2)
  })
})
