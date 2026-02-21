import { useLayoutEffect, useRef } from 'react'

export function useLatestRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
