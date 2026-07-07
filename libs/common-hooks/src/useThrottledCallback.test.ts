import { act, renderHook } from '@testing-library/react'

import { useThrottledCallback } from './useThrottledCallback'

describe('useThrottledCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('invokes immediately on first call and trailing call after burst', () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 1000))

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      result.current()
      result.current()
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('allows immediate call again after delay has elapsed', () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 1000))

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('never invokes immediately when makeResponsive is true', () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 1000, [], { makeResponsive: true }))

    act(() => {
      result.current()
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('clears pending trailing call when deps change', () => {
    const callback = jest.fn()
    const { result, rerender } = renderHook(({ dep }) => useThrottledCallback(callback, 1000, [dep]), {
      initialProps: { dep: 1 },
    })

    act(() => {
      result.current()
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    rerender({ dep: 2 })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('uses the latest callback for trailing invocation', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    const { result, rerender } = renderHook(({ callback }) => useThrottledCallback(callback, 1000), {
      initialProps: { callback: callback1 },
    })

    act(() => {
      result.current()
      result.current()
    })

    expect(callback1).toHaveBeenCalledTimes(1)

    rerender({ callback: callback2 })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })
})
