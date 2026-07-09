import { type DependencyList, useCallback, useEffect, useRef } from 'react'

/**
 * Optional options for {@link useThrottledCallback}.
 */
export interface UseThrottledCallbackOptions {
  /**
   * When `true`, `callback` is never invoked immediately; it always runs from a
   * scheduled timeout (trailing edge only).
   */
  makeResponsive?: boolean
}

/**
 * Returns a throttled version of `callback` with the specified delay.
 *
 * When invoked:
 * - Calls `callback` immediately if at least `delay` ms have passed since the last call.
 * - Otherwise schedules a trailing call via `setTimeout` once `delay` ms have elapsed.
 *
 * Ported from `@swyg/corre` to avoid an extra dependency.
 */
export function useThrottledCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
  deps: DependencyList = [],
  options: UseThrottledCallbackOptions = {},
): (...args: Args) => void {
  const timeoutRef = useRef<number | undefined>(undefined)
  const callbackRef = useRef(callback)
  const lastCalledRef = useRef(0)
  const { makeResponsive } = options

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    window.clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-controlled dependency list
  }, [...deps, delay])

  return useCallback(
    (...args: Args) => {
      window.clearTimeout(timeoutRef.current)

      function invoke(): void {
        callbackRef.current(...args)
        lastCalledRef.current = Date.now()
      }

      const elapsed = Date.now() - lastCalledRef.current

      if (elapsed >= delay && !makeResponsive) {
        invoke()
      } else {
        timeoutRef.current = window.setTimeout(invoke, Math.max(delay - elapsed, 0))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller-controlled dependency list
    [...deps, makeResponsive],
  )
}
