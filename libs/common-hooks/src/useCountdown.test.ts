import { createRef, RefObject } from 'react'

import { act, renderHook } from '@testing-library/react'

import { useSetLocalTimeOffset } from './localTimeOffsetState'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    renderHook(() => useSetLocalTimeOffset(undefined))
  })

  afterEach(() => {
    renderHook(() => useSetLocalTimeOffset(undefined))
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  function createTarget(
    element: HTMLSpanElement | null = document.createElement('span'),
  ): RefObject<HTMLSpanElement | null> {
    const targetRef = createRef<HTMLSpanElement>()
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })

    return targetRef
  }

  function advance(ms: number): void {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  }

  it('writes formatted text to the element', () => {
    const targetRef = createTarget()
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format: (remaining) => `${remaining}s`,
      }),
    )

    expect(targetRef.current?.textContent).toBe('90s')

    advance(1001)

    expect(targetRef.current?.textContent).toBe('89s')
  })

  it('ticks on the boundary of a fractional target', () => {
    const targetRef = createTarget()
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90.3,
        format: (remaining) => `${remaining}s`,
      }),
    )

    expect(targetRef.current?.textContent).toBe('91s')

    advance(299)
    expect(targetRef.current?.textContent).toBe('91s')

    advance(2)
    expect(targetRef.current?.textContent).toBe('90s')
  })

  it('uses the global local time offset', () => {
    const targetRef = createTarget()
    const nowSec = Date.now() / 1000

    renderHook(() => useSetLocalTimeOffset(50))

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 10,
        format: (remaining) => String(remaining),
      }),
    )

    expect(targetRef.current?.textContent).toBe('60')
  })

  it('does not schedule a timer when targetEpochSec is undefined', () => {
    const element = document.createElement('span')
    element.textContent = 'stale'
    const targetRef = createTarget(element)
    const format = jest.fn(() => '0s')

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: undefined,
        format,
      }),
    )

    expect(jest.getTimerCount()).toBe(0)
    expect(format).not.toHaveBeenCalled()
    expect(element.textContent).toBe('stale')
  })

  it('wakes up once per displayed second', () => {
    const targetRef = createTarget()
    const format = jest.fn((remaining: number) => `${remaining}s`)
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout')
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format,
      }),
    )

    advance(999)
    expect(format).toHaveBeenCalledTimes(1)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)

    advance(2)
    expect(format).toHaveBeenCalledTimes(2)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
  })

  it('stops scheduling once the countdown reaches zero', () => {
    const targetRef = createTarget()
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 2,
        format: (remaining) => `${remaining}s`,
      }),
    )

    advance(2100)

    expect(targetRef.current?.textContent).toBe('0s')
    expect(jest.getTimerCount()).toBe(0)
  })

  it('writes once the element is attached', () => {
    const targetRef = createTarget(null)
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format: (remaining) => `${remaining}s`,
      }),
    )

    const element = document.createElement('span')
    targetRef.current = element
    advance(100)

    expect(element.textContent).toBe('90s')
  })

  it('clears the pending timer on unmount', () => {
    const targetRef = createTarget()
    const nowSec = Date.now() / 1000

    const { unmount } = renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format: (remaining) => `${remaining}s`,
      }),
    )

    expect(jest.getTimerCount()).toBe(1)
    unmount()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('notifies onRemainingChange when the displayed second changes', () => {
    const targetRef = createTarget()
    const onRemainingChange = jest.fn()
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format: (remaining) => `${remaining}s`,
        onRemainingChange,
      }),
    )

    expect(onRemainingChange).toHaveBeenCalledWith(90)

    advance(1001)

    expect(onRemainingChange).toHaveBeenCalledWith(89)
  })
})
