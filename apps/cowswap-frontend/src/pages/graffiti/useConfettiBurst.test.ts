import { act, renderHook } from '@testing-library/react'

import { useConfettiBurst } from './useConfettiBurst'

describe('useConfettiBurst', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('bursts immediately, so the claim lands with the confetti rather than after it', () => {
    const { result } = renderHook(() => useConfettiBurst(3000))

    expect(result.current).toBe(true)
  })

  it('stops so the confetti canvas is not left over the page', () => {
    const { result } = renderHook(() => useConfettiBurst(3000))

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(result.current).toBe(false)
  })

  it('does not re-burst when the caller re-renders, as the balance poll does', () => {
    const { result, rerender } = renderHook(() => useConfettiBurst(3000))

    act(() => {
      jest.advanceTimersByTime(3000)
    })
    rerender()

    expect(result.current).toBe(false)
  })

  it('clears its timer on unmount', () => {
    const { unmount } = renderHook(() => useConfettiBurst(3000))

    unmount()

    expect(jest.getTimerCount()).toBe(0)
  })
})
