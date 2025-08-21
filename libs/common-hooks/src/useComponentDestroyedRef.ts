import { RefObject, useEffect, useRef } from 'react'

export function useComponentDestroyedRef(): RefObject<boolean> {
  const destroyedRef = useRef(false)

  useEffect(() => {
    destroyedRef.current = false

    return () => {
      destroyedRef.current = true
    }
  }, [])

  return destroyedRef
}
