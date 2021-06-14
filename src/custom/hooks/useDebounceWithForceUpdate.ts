import useDebounce from '@src/hooks/useDebounce'
import { useEffect, useState } from 'react'

// modified from https://usehooks.com/useDebounce/
export default function useDebounceWithForceUpdate<T>(latestValue: T, delay: number, forceUpdateRef?: any): T {
  // const value = useRef(latestValue)
  const [value, setValue] = useState(latestValue)
  const [needToUpdate, setNeedToUpdate] = useState(false)

  // Force update
  useEffect(() => setNeedToUpdate(true), [forceUpdateRef])
  useEffect(() => {
    if (needToUpdate) {
      setNeedToUpdate(false)
      setValue(latestValue)
    }
  }, [needToUpdate, latestValue])

  // Debounce update
  const debouncedValue = useDebounce(latestValue, delay)
  useEffect(() => {
    setValue(debouncedValue)
  }, [debouncedValue])

  return value
}
