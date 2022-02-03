import { useRef, useEffect } from 'react'

/**
 * Creates a ref that can be used to solve the issue of
 * "Can't perform a React state update on an unmounted component."
 */
export default function useIsMounted() {
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return isMounted
}
