import { act, renderHook } from '@testing-library/react'

import { usePreventDoubleExecution } from './usePreventDoubleExecution'

describe('usePreventDoubleExecution', () => {
  describe('basic functionality', () => {
    it('should execute the function once when called', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        const promise = result.current.callback()
        await promise
      })

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should return the result from the function', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: string | undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as string | undefined
      })

      expect(actualResult).toBe('test result')
    })
  })

  describe('double execution prevention', () => {
    it('should prevent double execution when called multiple times', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        const promise1 = result.current.callback()
        const promise2 = result.current.callback()
        const promise3 = result.current.callback()

        await Promise.all([promise1, promise2, promise3])
      })

      // Only first call should return the result
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should return undefined for subsequent calls during execution', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let result1: string | undefined
      let result2: string | undefined
      let result3: string | undefined

      await act(async () => {
        const promise1 = result.current.callback()
        const promise2 = result.current.callback()
        const promise3 = result.current.callback()

        result1 = (await promise1) as string | undefined
        result2 = (await promise2) as string | undefined
        result3 = (await promise3) as string | undefined
      })

      // only first call should return the result
      expect(result1).toBe('test result')
      expect(result2).toBeUndefined()
      expect(result3).toBeUndefined()
    })

    it('should allow execution after previous execution completes', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        await result.current.callback()
      })

      await act(async () => {
        await result.current.callback()
      })

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should handle function errors and reset execution state', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('test error'))
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        try {
          await result.current.callback()
        } catch {
          // Expected error
        }
      })

      expect(mockFn).toHaveBeenCalledTimes(1)

      await act(async () => {
        try {
          await result.current.callback()
        } catch {
          // Expected error
        }
      })

      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should reset execution state even when function throws', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('test error'))
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        try {
          await result.current.callback()
        } catch {
          // Expected error
        }
      })

      await act(async () => {
        try {
          await result.current.callback()
        } catch {
          // Expected error
        }
      })

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('async behavior', () => {
    it('should handle async functions correctly', async () => {
      const mockFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'async result'
      })
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: string | undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as string | undefined
      })

      expect(actualResult).toBe('async result')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should prevent execution during async operations', async () => {
      const mockFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return 'async result'
      })
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let result1: string | undefined
      let result2: string | undefined

      await act(async () => {
        const promise1 = result.current.callback()
        const promise2 = result.current.callback()

        result1 = (await promise1) as string | undefined
        result2 = (await promise2) as string | undefined
      })

      // only first call should be executed
      expect(result1).toBe('async result')
      expect(result2).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('hook dependencies', () => {
    it('should recreate callback when function changes', () => {
      const mockFn1 = jest.fn()
      const mockFn2 = jest.fn()
      const { result, rerender } = renderHook(({ fn }) => usePreventDoubleExecution(fn), {
        initialProps: { fn: mockFn1 },
      })

      const firstCallback = result.current.callback

      rerender({ fn: mockFn2 })
      const secondCallback = result.current.callback

      expect(firstCallback).not.toBe(secondCallback)
    })

    it('should maintain execution state across rerenders with same function', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result, rerender } = renderHook(({ fn }) => usePreventDoubleExecution(fn), {
        initialProps: { fn: mockFn },
      })

      await act(async () => {
        await result.current.callback()
      })

      rerender({ fn: mockFn })

      await act(async () => {
        await result.current.callback()
      })

      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('should handle function that returns undefined', async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as undefined
      })

      expect(actualResult).toBeUndefined()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle function that returns null', async () => {
      const mockFn = jest.fn().mockResolvedValue(null)
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: null | undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as null | undefined
      })

      expect(actualResult).toBeNull()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle function that returns 0', async () => {
      const mockFn = jest.fn().mockResolvedValue(0)
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: number | undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as number | undefined
      })

      expect(actualResult).toBe(0)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle function that returns empty string', async () => {
      const mockFn = jest.fn().mockResolvedValue('')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      let actualResult: string | undefined
      await act(async () => {
        actualResult = (await result.current.callback()) as string | undefined
      })

      expect(actualResult).toBe('')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('concurrent execution scenarios', () => {
    it('should handle rapid successive calls', async () => {
      const mockFn = jest.fn().mockResolvedValue('test result')
      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      const promises: Promise<unknown>[] = []

      await act(async () => {
        for (let i = 0; i < 10; i++) {
          promises.push(result.current.callback())
        }

        await Promise.all(promises)
      })

      // only first call should return the result
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed success and failure scenarios', async () => {
      const mockFn = jest
        .fn()
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('failure'))
        .mockResolvedValueOnce('success again')

      const { result } = renderHook(() => usePreventDoubleExecution(mockFn))

      await act(async () => {
        const result1 = (await result.current.callback()) as string | undefined
        expect(result1).toBe('success')
      })

      await act(async () => {
        try {
          await result.current.callback()
        } catch {
          // Expected error
        }
      })

      await act(async () => {
        const result3 = (await result.current.callback()) as string | undefined
        expect(result3).toBe('success again')
      })

      expect(mockFn).toHaveBeenCalledTimes(3)
    })
  })
})
