import { useState } from 'react'

// modified from https://github.com/uidotdev/usehooks/blob/main/index.js#L1017
export function usePrevious<T>(value: T): T | null {
  const [current, setCurrent] = useState(value)
  const [previous, setPrevious] = useState<T | null>(null)

  if (value !== current) {
    setPrevious(current)
    setCurrent(value)
  }

  return previous
}
