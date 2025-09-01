import { useEffect, useMemo, useState } from 'react'

export interface UseElementViewportTrackingReturn {
  rect: DOMRect | null
  viewportVersion: number
}

/**
 * Hook for tracking viewport changes and element positioning
 * @param element - The reference element to track
 * @param enabled - Whether viewport tracking is enabled
 * @returns Object with element's bounding rect and version number that increments on viewport changes
 */
export function useElementViewportTracking(
  element: HTMLElement | null,
  enabled: boolean = true,
): UseElementViewportTrackingReturn {
  // State to force recalculation on viewport changes
  const [viewportVersion, setViewportVersion] = useState(0)

  // Efficient viewport change detection with debouncing
  useEffect(() => {
    if (!enabled) return

    let timeoutId: number | undefined

    const debouncedResize = (): void => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        setViewportVersion(prev => prev + 1)
      }, 16) // ~60fps debounce
    }

    // Use ResizeObserver for reference element changes if available
    let resizeObserver: ResizeObserver | undefined
    if (element && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(debouncedResize)
      resizeObserver.observe(element)
    }

    // Minimal event listeners for actual viewport changes
    window.addEventListener('resize', debouncedResize, { passive: true })
    window.addEventListener('orientationchange', debouncedResize, { passive: true })

    // Visual viewport for mobile browser UI changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedResize)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', debouncedResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedResize)
      }
    }
  }, [enabled, element])

  // Get current element rect
  const rect = useMemo(() => {
    if (!element || !enabled) return null
    return element.getBoundingClientRect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, enabled, viewportVersion])

  return {
    rect,
    viewportVersion,
  }
}