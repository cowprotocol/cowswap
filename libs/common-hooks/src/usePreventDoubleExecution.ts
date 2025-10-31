import { useCallback, useRef, useState } from 'react'

export function usePreventDoubleExecution<R>(fn: () => Promise<R>): {
  callback: () => Promise<R | undefined>
  isExecuting: boolean
} {
  const isExecutingRef = useRef(false)
  const [isExecuting, setIsExecuting] = useState(false)

  return {
    callback: useCallback(async (): Promise<R | undefined> => {
      if (isExecutingRef.current) return

      isExecutingRef.current = true
      setIsExecuting(true)

      try {
        const result = await fn()
        return result
      } finally {
        isExecutingRef.current = false
        setIsExecuting(false)
      }
    }, [fn]),
    isExecuting,
  }
}
