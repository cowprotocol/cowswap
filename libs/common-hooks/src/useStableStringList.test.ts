import { renderHook } from '@testing-library/react'

import { useStableStringList } from './useStableStringList'

describe('useStableStringList', () => {
  it('keeps the previous reference when a new array has identical contents', () => {
    const { result, rerender } = renderHook(({ list }) => useStableStringList(list), {
      initialProps: { list: ['a', 'b'] },
    })
    const first = result.current

    rerender({ list: ['a', 'b'] }) // new array, same content

    expect(result.current).toBe(first)
  })

  it('returns a new reference when a value changes', () => {
    const { result, rerender } = renderHook(({ list }) => useStableStringList(list), {
      initialProps: { list: ['a', 'b'] },
    })
    const first = result.current

    rerender({ list: ['a', 'c'] })

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual(['a', 'c'])
  })

  it('returns a new reference when the length changes', () => {
    const { result, rerender } = renderHook(({ list }) => useStableStringList(list), {
      initialProps: { list: ['a'] },
    })
    const first = result.current

    rerender({ list: ['a', 'b'] })

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual(['a', 'b'])
  })

  it('stays stable across several identical-content renders', () => {
    const { result, rerender } = renderHook(({ list }) => useStableStringList(list), {
      initialProps: { list: ['x'] },
    })
    const first = result.current

    rerender({ list: ['x'] })
    rerender({ list: ['x'] })

    expect(result.current).toBe(first)
  })
})
