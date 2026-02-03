import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { useCloseTokenSelectWidget } from './useCloseTokenSelectWidget'

import { selectTokenWidgetAtom, updateSelectTokenWidgetAtom } from '../state/selectTokenWidgetAtom'

function createTestWrapper(store: ReturnType<typeof createStore>) {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useCloseTokenSelectWidget', () => {
  it('returns stable reference when forceOpen toggles', () => {
    const store = createStore()
    const wrapper = createTestWrapper(store)

    const { result, rerender } = renderHook(() => useCloseTokenSelectWidget(), { wrapper })
    const firstRef = result.current

    // Toggle forceOpen to true
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { forceOpen: true })
    })
    rerender()
    expect(result.current).toBe(firstRef) // Same reference

    // Toggle forceOpen back to false
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { forceOpen: false })
    })
    rerender()
    expect(result.current).toBe(firstRef) // Still same reference
  })

  it('does NOT reset state when forceOpen is true and overrideForceLock is not set', () => {
    const store = createStore()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(() => useCloseTokenSelectWidget(), { wrapper })

    // Set forceOpen = true, open = true
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { forceOpen: true, open: true })
    })

    // Call without override - should NOT reset
    act(() => {
      result.current()
    })
    expect(store.get(selectTokenWidgetAtom).open).toBe(true)
  })

  it('resets state when forceOpen is true but overrideForceLock is set', () => {
    const store = createStore()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(() => useCloseTokenSelectWidget(), { wrapper })

    // Set forceOpen = true, open = true
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { forceOpen: true, open: true })
    })

    // Call with override - SHOULD reset
    act(() => {
      result.current({ overrideForceLock: true })
    })
    expect(store.get(selectTokenWidgetAtom).open).toBe(false)
  })

  it('resets state when forceOpen is false', () => {
    const store = createStore()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(() => useCloseTokenSelectWidget(), { wrapper })

    // Set open = true, forceOpen = false
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { open: true, forceOpen: false })
    })

    // Call without override - should reset because forceOpen is false
    act(() => {
      result.current()
    })
    expect(store.get(selectTokenWidgetAtom).open).toBe(false)
  })

  it('uses latest forceOpen value immediately (no stale closure)', () => {
    const store = createStore()
    const wrapper = createTestWrapper(store)

    const { result, rerender } = renderHook(() => useCloseTokenSelectWidget(), { wrapper })

    // Set open = true, forceOpen = false
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { open: true, forceOpen: false })
    })
    rerender()

    // Now toggle forceOpen to true in the same test
    act(() => {
      store.set(updateSelectTokenWidgetAtom, { forceOpen: true })
    })
    rerender()

    // Calling without override should NOT reset because forceOpen is now true
    act(() => {
      result.current()
    })
    expect(store.get(selectTokenWidgetAtom).open).toBe(true)
  })
})
