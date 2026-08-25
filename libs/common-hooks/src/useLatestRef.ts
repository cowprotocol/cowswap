import { useLayoutEffect, useRef } from 'react'

export function useLatestNonNullRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    if (value !== null) ref.current = value
  }, [value])

  return ref
}

export function useLatestRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
