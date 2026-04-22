import { act, renderHook } from '@testing-library/react'

import { useNonEvmReceiverConfirmed, useSetNonEvmReceiverConfirmed } from './nonEvmReceiverConfirmedAtom.atoms'

function renderBoth(): ReturnType<typeof renderHook<{ value: boolean; set: (v: boolean) => void }>> {
  return renderHook(() => ({
    value: useNonEvmReceiverConfirmed(),
    set: useSetNonEvmReceiverConfirmed(),
  }))
}

describe('nonEvmReceiverConfirmedAtom', () => {
  describe('useNonEvmReceiverConfirmed', () => {
    it('returns false initially', () => {
      const { result } = renderBoth()
      expect(result.current.value).toBe(false)
    })
  })

  describe('useSetNonEvmReceiverConfirmed', () => {
    it('returns a stable function reference across re-renders', () => {
      const { result, rerender } = renderBoth()
      const first = result.current.set
      rerender()
      expect(result.current.set).toBe(first)
    })

    it('sets value to true', () => {
      const { result } = renderBoth()
      act(() => result.current.set(true))
      expect(result.current.value).toBe(true)
    })

    it('sets value back to false', () => {
      const { result } = renderBoth()
      act(() => result.current.set(true))
      act(() => result.current.set(false))
      expect(result.current.value).toBe(false)
    })
  })
})
