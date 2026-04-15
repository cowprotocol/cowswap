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

    let rafId: number | null = null

    const debouncedResize = (): void => {
      if (rafId != null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        setViewportVersion((prev) => prev + 1)
      })
    }

    // Use ResizeObserver for reference element changes if available
    let resizeObserver: ResizeObserver | undefined
    if (element && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(debouncedResize)
      resizeObserver.observe(element)
    }

    // Observe intersection changes so ancestor/root scrolls can trigger updates
    let intersectionObserver: IntersectionObserver | undefined
    if (element && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(() => {
        debouncedResize()
      })
      intersectionObserver.observe(element)
    }

    // Minimal event listeners for actual viewport changes
    window.addEventListener('resize', debouncedResize, { passive: true })
    window.addEventListener('orientationchange', debouncedResize, { passive: true })
    // Root scrolls (best-effort; element scroll containers handled by IO above)
    window.addEventListener('scroll', debouncedResize, { passive: true })

    // Visual viewport for mobile browser UI changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedResize)
      // Visual viewport scroll changes (e.g., mobile toolbars)
      window.visualViewport.addEventListener('scroll', debouncedResize)
    }

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', debouncedResize)
      window.removeEventListener('scroll', debouncedResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedResize)
        window.visualViewport.removeEventListener('scroll', debouncedResize)
      }
    }
  }, [enabled, element])

  // Get current element rect
  const rect = useMemo(() => {
    if (!element || !enabled) return null
    // Access viewportVersion so the memo recomputes whenever it increments
    void viewportVersion
    return element.getBoundingClientRect()
  }, [element, enabled, viewportVersion])

  return useMemo(() => ({ rect, viewportVersion }), [rect, viewportVersion])
}
