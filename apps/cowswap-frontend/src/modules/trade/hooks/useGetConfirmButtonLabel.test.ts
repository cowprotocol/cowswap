import { renderHook } from '@testing-library/react'

import { useGetConfirmButtonLabel } from './useGetConfirmButtonLabel'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    _: (descriptor: { message?: string; id?: string }) => descriptor.message ?? descriptor.id ?? '',
  }),
}))

describe('useGetConfirmButtonLabel', () => {
  describe('variant: swap', () => {
    it('returns "Swap" when not bridging and not in confirm modal', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('swap', false))
      expect(result.current).toBe('Swap')
    })

    it('returns "Swap and Bridge" when bridging and not in confirm modal', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('swap', true))
      expect(result.current).toBe('Swap and Bridge')
    })

    it('returns "Confirm Swap" when not bridging and in confirm modal', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('swap', false, true))
      expect(result.current).toBe('Confirm Swap')
    })

    it('returns "Confirm Swap and Bridge" when bridging and in confirm modal', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('swap', true, true))
      expect(result.current).toBe('Confirm Swap and Bridge')
    })
  })

  describe('variant: approve', () => {
    it('returns "Approve and Swap" when not bridging', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('approve', false))
      expect(result.current).toBe('Approve and Swap')
    })

    it('returns "Approve, Swap & Bridge" when bridging', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('approve', true))
      expect(result.current).toBe('Approve, Swap & Bridge')
    })

    it('ignores isConfirmModal when variant is approve (not bridging)', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('approve', false, true))
      expect(result.current).toBe('Approve and Swap')
    })

    it('ignores isConfirmModal when variant is approve (bridging)', () => {
      const { result } = renderHook(() => useGetConfirmButtonLabel('approve', true, true))
      expect(result.current).toBe('Approve, Swap & Bridge')
    })
  })
})
