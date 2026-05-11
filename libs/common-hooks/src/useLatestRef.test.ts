import { renderHook } from '@testing-library/react'

import { useLatestRef } from './useLatestRef'

describe('useLatestRef', () => {
  it('returns a ref whose current matches the latest value', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'a' },
    })

    expect(result.current.current).toBe('a')

    rerender({ value: 'b' })
    expect(result.current.current).toBe('b')

    rerender({ value: 'c' })
    expect(result.current.current).toBe('c')
  })

  it('keeps the same ref object identity across renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 0 },
    })

    const firstRef = result.current
    rerender({ value: 1 })
    expect(result.current).toBe(firstRef)
  })
})
