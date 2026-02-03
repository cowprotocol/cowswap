import { act, renderHook } from '@testing-library/react'

import { useDisabledChainTooltip } from './useDisabledChainTooltip'

describe('useDisabledChainTooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const DURATION_MS = 3000
  const CHAIN_ID_1 = 1
  const CHAIN_ID_2 = 100

  describe('initial state', () => {
    it('starts with no active tooltip', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      expect(result.current.activeTooltipChainId).toBeNull()
    })
  })

  describe('toggleTooltip', () => {
    it('shows tooltip for the given chain id', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })

      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)
    })

    it('hides tooltip when toggling the same chain id', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })

    it('switches to different chain when toggling a new chain id', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_2)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_2)
    })

    it('auto-hides tooltip after specified duration', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        jest.advanceTimersByTime(DURATION_MS - 1)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        jest.advanceTimersByTime(1)
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })

    it('resets auto-hide timer when switching to a different chain', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })

      act(() => {
        jest.advanceTimersByTime(DURATION_MS - 500)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_2)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_2)

      // Original timer would have fired by now, but it was cleared
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_2)

      // New timer fires after full duration from switch
      act(() => {
        jest.advanceTimersByTime(DURATION_MS - 500)
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })

    it('clears timer when toggling off', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1) // Toggle off
      })
      expect(result.current.activeTooltipChainId).toBeNull()

      // Timer should not cause any state changes
      act(() => {
        jest.advanceTimersByTime(DURATION_MS * 2)
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })
  })

  describe('hideTooltip', () => {
    it('hides the active tooltip', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })
      expect(result.current.activeTooltipChainId).toBe(CHAIN_ID_1)

      act(() => {
        result.current.hideTooltip()
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })

    it('clears pending auto-hide timer', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })

      act(() => {
        result.current.hideTooltip()
      })

      // Timer should have been cleared, no state changes expected
      act(() => {
        jest.advanceTimersByTime(DURATION_MS * 2)
      })
      expect(result.current.activeTooltipChainId).toBeNull()
    })

    it('is safe to call when no tooltip is active', () => {
      const { result } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      expect(() => {
        act(() => {
          result.current.hideTooltip()
        })
      }).not.toThrow()

      expect(result.current.activeTooltipChainId).toBeNull()
    })
  })

  describe('cleanup', () => {
    it('clears timer on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')
      const { result, unmount } = renderHook(() => useDisabledChainTooltip(DURATION_MS))

      act(() => {
        result.current.toggleTooltip(CHAIN_ID_1)
      })

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })
  })
})
