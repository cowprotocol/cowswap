import { act, renderHook, waitFor } from '@testing-library/react'

import { useStateWithDeferredValue } from './useStateWithDeferredValue'

describe('useStateWithDeferredValue', () => {
  it('returns initial state, setState, and deferred value', () => {
    const cb = jest.fn()
    const { result } = renderHook(() => useStateWithDeferredValue<string>('init', cb))

    const [state, setState, deferredValue] = result.current
    expect(state).toBe('init')
    expect(typeof setState).toBe('function')
    expect(deferredValue).toBeDefined()
  })

  it('does not invoke deferred callback on first render', () => {
    const cb = jest.fn()
    renderHook(() => useStateWithDeferredValue<string>('init', cb))
    expect(cb).not.toHaveBeenCalled()
  })

  it('invokes deferred callback after state updates (after first render)', async () => {
    const cb = jest.fn()
    const { result } = renderHook(() => useStateWithDeferredValue<string>('init', cb))

    await act(async () => {
      result.current[1]('next')
    })

    await waitFor(() => {
      expect(cb).toHaveBeenCalled()
    })

    const lastArg = cb.mock.calls[cb.mock.calls.length - 1][0]
    expect(lastArg).toBe('next')
  })

  it('keeps the latest deferred callback via ref when callback identity changes', async () => {
    const cb1 = jest.fn()
    const cb2 = jest.fn()
    const { result, rerender } = renderHook(({ fn }) => useStateWithDeferredValue<string>('init', fn), {
      initialProps: { fn: cb1 },
    })

    await act(async () => {
      result.current[1]('step1')
    })
    await waitFor(() => expect(cb1).toHaveBeenCalled())

    rerender({ fn: cb2 })

    await act(async () => {
      result.current[1]('step2')
    })
    await waitFor(() => expect(cb2).toHaveBeenCalled())
  })
})
