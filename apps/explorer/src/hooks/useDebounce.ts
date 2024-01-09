import React, { useEffect, useState } from 'react'

export const useDebounce = <T>(
  value: T,
  delay: number,
): {
  value: T
  setImmediate: React.Dispatch<React.SetStateAction<T>>
} => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return (): void => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return { value: debouncedValue, setImmediate: setDebouncedValue }
}
