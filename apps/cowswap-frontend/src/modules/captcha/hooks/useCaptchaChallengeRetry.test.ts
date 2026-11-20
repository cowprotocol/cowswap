import { act, renderHook } from '@testing-library/react'

import { useCaptchaChallengeRetry } from './useCaptchaChallengeRetry'

describe('useCaptchaChallengeRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resets immediately once for timeout-or-duplicate, then uses backoff', () => {
    const { result } = renderHook(() => useCaptchaChallengeRetry())
    const resetWidget = jest.fn()

    act(() => {
      result.current.scheduleRetry(resetWidget, { immediate: true })
    })

    expect(resetWidget).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.scheduleRetry(resetWidget, { immediate: true })
    })

    expect(resetWidget).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(999)
    })
    expect(resetWidget).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(resetWidget).toHaveBeenCalledTimes(2)
  })

  it('backs off from 1s and caps at 30s', () => {
    const { result } = renderHook(() => useCaptchaChallengeRetry())

    for (const delay of [1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000]) {
      const resetWidget = jest.fn()

      act(() => {
        result.current.scheduleRetry(resetWidget)
      })

      act(() => {
        jest.advanceTimersByTime(delay - 1)
      })
      expect(resetWidget).not.toHaveBeenCalled()

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(resetWidget).toHaveBeenCalledTimes(1)
    }
  })

  it('starts the backoff over after a successful exchange', () => {
    const { result } = renderHook(() => useCaptchaChallengeRetry())
    const resetWidget = jest.fn()

    act(() => {
      result.current.scheduleRetry(resetWidget, { immediate: true })
      result.current.scheduleRetry(resetWidget)
    })

    act(() => {
      result.current.resetAttempts()
      result.current.scheduleRetry(resetWidget, { immediate: true })
    })

    expect(resetWidget).toHaveBeenCalledTimes(2)

    act(() => {
      result.current.scheduleRetry(resetWidget)
    })

    act(() => {
      jest.advanceTimersByTime(999)
    })
    expect(resetWidget).toHaveBeenCalledTimes(2)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(resetWidget).toHaveBeenCalledTimes(3)
  })

  it('drops a pending retry when a newer one is scheduled or the hook unmounts', () => {
    const { result, unmount } = renderHook(() => useCaptchaChallengeRetry())
    const firstReset = jest.fn()
    const secondReset = jest.fn()

    act(() => {
      result.current.scheduleRetry(firstReset)
      result.current.scheduleRetry(secondReset)
    })

    act(() => {
      jest.advanceTimersByTime(1_000)
    })
    expect(firstReset).not.toHaveBeenCalled()
    expect(secondReset).not.toHaveBeenCalled()

    unmount()

    act(() => {
      jest.advanceTimersByTime(1_000)
    })
    expect(secondReset).not.toHaveBeenCalled()
  })
})
