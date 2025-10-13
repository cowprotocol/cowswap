import { useEffect, useState } from 'react'

import { useComponentDestroyedRef } from './useComponentDestroyedRef'

/**
 * React hook that mirrors the current `prefers-reduced-motion` media query.
 * Persists compatibility with older browsers by falling back to add/removeListener.
 */
export function useReducedMotionPreference(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const destroyedRef = useComponentDestroyedRef()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updatePreference = (matches: boolean): void => {
      if (!destroyedRef.current) {
        setPrefersReducedMotion(matches)
      }
    }

    const handleChange = (event?: MediaQueryListEvent): void => {
      updatePreference(event?.matches ?? mediaQuery.matches)
    }

    updatePreference(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)

      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    const legacyHandler = (): void => handleChange()
    window.addEventListener('resize', legacyHandler)

    return () => {
      window.removeEventListener('resize', legacyHandler)
    }
  }, [destroyedRef])

  return prefersReducedMotion
}
