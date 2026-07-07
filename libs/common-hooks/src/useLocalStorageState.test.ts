import { act, renderHook } from '@testing-library/react'

import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'test-local-storage-state'

function clampWidth(width: number): number {
  return Math.min(Math.max(width, 380), 800)
}

describe('useLocalStorageState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists primitive updates immediately', () => {
    const { result } = renderHook(() =>
      useLocalStorageState(STORAGE_KEY, (persistedValue) =>
        typeof persistedValue === 'boolean' ? persistedValue : true,
      ),
    )

    act(() => {
      result.current[1](false)
    })

    expect(result.current[0]).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
  })

  it('normalizes primitive values on init and persists the corrected value', () => {
    localStorage.setItem(STORAGE_KEY, '9999')

    renderHook(() =>
      useLocalStorageState(STORAGE_KEY, (persistedValue) =>
        clampWidth(typeof persistedValue === 'number' ? persistedValue : 380),
      ),
    )

    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(clampWidth(9999)))
  })

  it('debounces writes when a delay is provided', () => {
    jest.useFakeTimers()

    const { result } = renderHook(() => useLocalStorageState(STORAGE_KEY, true, 500))

    // Init normalization persists immediately, bypassing the debounce delay.
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

    act(() => {
      result.current[1](false)
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('false')

    jest.useRealTimers()
  })
})
