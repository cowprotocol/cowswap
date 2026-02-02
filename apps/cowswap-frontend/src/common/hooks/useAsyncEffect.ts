import React, { useEffect } from 'react'

/**
 * Runs an async effect with optional cleanup, similar to `useEffect` but for promises.
 *
 * If the promise resolves to a function, that function is used as cleanup when the effect
 * re-runs or the component unmounts. If the component unmounts before the promise settles,
 * the cleanup function, if any, is invoked as soon as the Promise resolves.
 *
 * @param fn - Async function to run. May resolve to a cleanup function (or void).
 * @param deps - Dependency list; effect re-runs when these change (same as `useEffect`).
 */
export function useAsyncEffect(fn: () => Promise<void | (() => void)>, deps: React.DependencyList): void {
  useEffect(() => {
    let isMounted = true
    let cleanupFn: undefined | (() => void)

    fn().then((res) => {
      if (isMounted) {
        cleanupFn = typeof res === 'function' ? res : undefined
      } else if (typeof res === 'function') {
        // useEffect cleanup has already executed and cleanupFn was undefined,
        // so we call the cleanup function immediately:
        res()
      }
    })

    return () => {
      isMounted = false
      cleanupFn?.()
    }
  }, deps)
}
