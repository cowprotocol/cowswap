import { renderHook } from '@testing-library/react'

import { useStableStringArray } from './useStableStringArray'

describe('useStableStringArray', () => {
  it('returns the same reference across renders when contents are element-wise equal', () => {
    const { result, rerender } = renderHook(({ value }: { value: string[] }) => useStableStringArray(value), {
      initialProps: { value: ['a', 'b', 'c'] },
    })
    const first = result.current

    rerender({ value: ['a', 'b', 'c'] })

    expect(result.current).toBe(first)
  })

  it('returns a new reference when an element changes', () => {
    const { result, rerender } = renderHook(({ value }: { value: string[] }) => useStableStringArray(value), {
      initialProps: { value: ['a', 'b'] },
    })
    const first = result.current

    rerender({ value: ['a', 'c'] })

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual(['a', 'c'])
  })

  it('returns a new reference when the array length changes', () => {
    const { result, rerender } = renderHook(({ value }: { value: string[] }) => useStableStringArray(value), {
      initialProps: { value: ['a', 'b'] },
    })
    const first = result.current

    rerender({ value: ['a', 'b', 'c'] })

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual(['a', 'b', 'c'])
  })

  it('keeps a stable reference for empty arrays', () => {
    const { result, rerender } = renderHook(({ value }: { value: string[] }) => useStableStringArray(value), {
      initialProps: { value: [] as string[] },
    })
    const first = result.current

    rerender({ value: [] })

    expect(result.current).toBe(first)
  })

  it('preserves element order — same elements in different order produce a new reference', () => {
    const { result, rerender } = renderHook(({ value }: { value: string[] }) => useStableStringArray(value), {
      initialProps: { value: ['a', 'b'] },
    })
    const first = result.current

    rerender({ value: ['b', 'a'] })

    expect(result.current).not.toBe(first)
  })
})
