import { useEffect, useRef } from 'react'

// modified from https://usehooks.com/usePrevious/
export function usePrevious<T>(value: T): T | null {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>(value)

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  // eslint-disable-next-line react-hooks/refs
  return ref.current
}
