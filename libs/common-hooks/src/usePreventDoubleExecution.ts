import { useCallback, useState } from 'react'

export function usePreventDoubleExecution<R>(fn: () => Promise<R>): {
  callback: () => Promise<R | undefined>
  isExecuting: boolean
} {
  const [isExecuting, setIsExecuting] = useState(false)

  return {
    callback: useCallback(async (): Promise<R | undefined> => {
      if (isExecuting) return

      setIsExecuting(true)
      try {
        const result = await fn()
        return result
      } finally {
        setIsExecuting(false)
      }
    }, [fn, isExecuting]),
    isExecuting,
  }
}
