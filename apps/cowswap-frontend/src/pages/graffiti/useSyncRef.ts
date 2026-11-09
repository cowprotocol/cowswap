import { useLayoutEffect, type MutableRefObject } from 'react'

/**
 * Keep `ref.current` equal to `value` after every commit. Event handlers and
 * the render loop read it without re-subscribing; a layout effect runs before
 * paint, so they never observe a stale value.
 */
export function useSyncRef<T>(ref: MutableRefObject<T>, value: T): void {
  useLayoutEffect(() => {
    ref.current = value
  }, [ref, value])
}
