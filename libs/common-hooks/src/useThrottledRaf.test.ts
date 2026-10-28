import { act, renderHook } from '@testing-library/react'

import { useThrottledRaf } from './useThrottledRaf'

describe('useThrottledRaf', () => {
  let rafCallback: FrameRequestCallback | null

  beforeEach(() => {
    rafCallback = null
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return 1
    })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('starts a rAF loop when enabled', () => {
    const callback = jest.fn()
    renderHook(() => useThrottledRaf(callback, true))

    expect(window.requestAnimationFrame).toHaveBeenCalled()
    act(() => {
      rafCallback?.(16)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not start a loop when disabled', () => {
    renderHook(() => useThrottledRaf(jest.fn(), false))
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('defaults to a 100ms throttle between invocations', () => {
    const callback = jest.fn()
    renderHook(() => useThrottledRaf(callback, true))

    act(() => {
      rafCallback?.(0)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      rafCallback?.(99)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      rafCallback?.(100)
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('respects an explicit minIntervalMs', () => {
    const callback = jest.fn()
    renderHook(() => useThrottledRaf(callback, true, 50))

    act(() => {
      rafCallback?.(0)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      rafCallback?.(30)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      rafCallback?.(50)
    })
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('cancels the loop on unmount', () => {
    const { unmount } = renderHook(() => useThrottledRaf(jest.fn(), true))
    unmount()
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })
})
