import { useCallback, useState } from 'react'

export function usePreventDoubleExecution<R>(fn: () => Promise<R>): () => Promise<R | undefined> {
  const [isExecuting, setIsExecuting] = useState(false)

  return useCallback(async (): Promise<R | undefined> => {
    if (isExecuting) return

    setIsExecuting(true)
    try {
      const result = await fn()
      return result
    } finally {
      setIsExecuting(false)
    }
  }, [fn, isExecuting])
}
