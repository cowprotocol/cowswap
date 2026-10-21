import { createRef } from 'react'

import { act, renderHook } from '@testing-library/react'

import { useSetLocalTimeOffset } from './localTimeOffsetState'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  let rafCallback: FrameRequestCallback | null

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    rafCallback = null

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return 1
    })
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn())

    renderHook(() => useSetLocalTimeOffset(undefined))
  })

  afterEach(() => {
    renderHook(() => useSetLocalTimeOffset(undefined))
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  function flushFrame(now = 16): void {
    act(() => {
      rafCallback?.(now)
    })
  }

  it('writes formatted text to the element', () => {
    const targetRef = createRef<HTMLSpanElement>()
    const element = document.createElement('span')
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format: (remaining) => `${remaining}s`,
      }),
    )

    flushFrame()
    expect(element.textContent).toBe('90s')

    act(() => {
      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'))
    })
    flushFrame(1000)

    expect(element.textContent).toBe('89s')
  })

  it('uses the global local time offset', () => {
    const targetRef = createRef<HTMLSpanElement>()
    const element = document.createElement('span')
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })
    const nowSec = Date.now() / 1000

    renderHook(() => useSetLocalTimeOffset(50))

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 10,
        format: (remaining) => String(remaining),
      }),
    )

    flushFrame()
    expect(element.textContent).toBe('60')
  })

  it('does not start a loop when targetEpochSec is undefined', () => {
    const targetRef = createRef<HTMLSpanElement>()
    const element = document.createElement('span')
    element.textContent = 'stale'
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })
    const format = jest.fn(() => '0s')

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: undefined,
        format,
      }),
    )

    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
    expect(format).not.toHaveBeenCalled()
    expect(element.textContent).toBe('stale')
  })

  it('skips DOM writes when the displayed second is unchanged', () => {
    const targetRef = createRef<HTMLSpanElement>()
    const element = document.createElement('span')
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })
    const format = jest.fn((remaining: number) => `${remaining}s`)
    const nowSec = Date.now() / 1000

    renderHook(() =>
      useCountdown({
        targetRef,
        targetEpochSec: nowSec + 90,
        format,
      }),
    )

    flushFrame(16)
    flushFrame(116)
    expect(format).toHaveBeenCalledTimes(1)
  })

  it('notifies onRemainingChange when the displayed second changes', () => {
    const targetRef = createRef<HTMLSpanElement>()
    const element = document.createElement('span')
    Object.defineProperty(targetRef, 'current', { value: element, writable: true })
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

    flushFrame()
    expect(onRemainingChange).toHaveBeenCalledWith(90)

    act(() => {
      jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'))
    })
    flushFrame(1000)

    expect(onRemainingChange).toHaveBeenCalledWith(89)
  })
})
