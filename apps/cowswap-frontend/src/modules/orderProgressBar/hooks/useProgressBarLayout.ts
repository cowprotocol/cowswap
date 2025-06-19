import { useEffect, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { getHeightCSSVariables } from '../utils/heightManager'

/**
 * Hook to manage progress bar layout and prevent height shifts
 * Returns CSS variables and loading state for smooth rendering
 */
export function useProgressBarLayout(): {
  cssVariables: Record<string, string>
  isLayoutReady: boolean
} {
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const cssVariables = getHeightCSSVariables(isMobile)

  useEffect(() => {
    // Use RAF to ensure layout is painted before showing content
    const rafId = requestAnimationFrame(() => {
      setIsLayoutReady(true)
    })

    return () => cancelAnimationFrame(rafId)
  }, [])

  return {
    cssVariables,
    isLayoutReady,
  }
}
