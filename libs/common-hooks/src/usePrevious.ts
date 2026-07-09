import { type RefObject, useEffect, useRef } from 'react'

/** Ref synced to the latest value on each commit (shared by {@link usePrevious}). */
export function usePreviousRef<T>(value: T): RefObject<T> {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

// modified from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T): T | null {
  const ref = usePreviousRef(value)

  // Return previous value (happens before update in useEffect above)
  // eslint-disable-next-line react-hooks/refs
  return ref.current
}
