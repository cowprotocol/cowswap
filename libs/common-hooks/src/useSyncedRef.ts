import { useMemo, useRef } from 'react'

/**
 * Like `useRef`, but it returns immutable ref that contains actual value.
 *
 * @param value
 * @see https://github.com/react-hookz/web/blob/master/src/useSyncedRef/index.ts
 */
export function useSyncedRef<T>(value: T): { readonly current: T } {
  const ref = useRef(value)

  ref.current = value

  return useMemo(
    () =>
      Object.freeze({
        get current() {
          return ref.current
        },
      }),
    [],
  )
}
