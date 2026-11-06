import { act, renderHook } from '@testing-library/react'

import { useRemainingSeconds } from './useRemainingSeconds'

describe('useRemainingSeconds', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  function advance(ms: number): void {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  }

  it('returns the remaining seconds on the first render', () => {
    const { result } = renderHook(() => useRemainingSeconds(Date.now() + 90_300))

    expect(result.current).toBe(91)
  })

  it('re-renders once per displayed second', () => {
    const targetEpochMs = Date.now() + 3000
    let renders = 0

    const { result } = renderHook(() => {
      renders++
      return useRemainingSeconds(targetEpochMs)
    })
    const initialRenders = renders

    advance(999)
    expect(result.current).toBe(3)
    expect(renders).toBe(initialRenders)

    advance(1)
    expect(result.current).toBe(2)
    expect(renders).toBe(initialRenders + 1)
  })

  it('stops at zero', () => {
    const targetEpochMs = Date.now() + 2000
    const { result } = renderHook(() => useRemainingSeconds(targetEpochMs))

    advance(5000)

    expect(result.current).toBe(0)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('returns undefined without a target and schedules nothing', () => {
    const { result } = renderHook(() => useRemainingSeconds(null))

    expect(result.current).toBeUndefined()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('restarts when the target changes and resets when it is cleared', () => {
    const nowMs = Date.now()
    const { result, rerender } = renderHook(({ target }) => useRemainingSeconds(target), {
      initialProps: { target: (nowMs + 5000) as number | null },
    })

    rerender({ target: nowMs + 60_000 })
    expect(result.current).toBe(60)

    rerender({ target: null })
    expect(result.current).toBeUndefined()
    expect(jest.getTimerCount()).toBe(0)
  })

  it('never renders a value that belongs to the previous target', () => {
    const nowMs = Date.now()
    const rendered: Array<number | undefined> = []

    const { rerender } = renderHook(
      ({ target }) => {
        const remainingSec = useRemainingSeconds(target)
        rendered.push(remainingSec)
        return remainingSec
      },
      { initialProps: { target: (nowMs + 30_000) as number | null } },
    )

    rendered.length = 0
    rerender({ target: null })
    expect(rendered).toEqual([undefined])

    rendered.length = 0
    rerender({ target: nowMs + 5000 })
    expect(new Set(rendered)).toEqual(new Set([5]))
  })

  it('clears the pending timer on unmount', () => {
    const { unmount } = renderHook(() => useRemainingSeconds(Date.now() + 90_000))

    expect(jest.getTimerCount()).toBe(1)
    unmount()
    expect(jest.getTimerCount()).toBe(0)
  })
})
