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
      return undefined
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

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }

    if (typeof mediaQuery.addListener === 'function') {
      const legacyHandler = (event: MediaQueryListEvent): void => handleChange(event)
      // Safari <= 13 shipped matchMedia without EventTarget support, so we keep the deprecated API
      mediaQuery.addListener(legacyHandler)

      return () => {
        mediaQuery.removeListener(legacyHandler)
      }
    }
    return undefined
  }, [destroyedRef])

  return prefersReducedMotion
}
