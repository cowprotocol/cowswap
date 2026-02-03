import { useCallback, useEffect, useMemo, useState } from 'react'

interface DeferredVisibilityOptions {
  /**
   * Expands the observed viewport so we hydrate content slightly before it
   * scrolls into view.
   */
  rootMargin?: string
  /**
   * When this key changes we reset the visibility state. Helpful when the same
   * virtualized row instance renders different data.
   */
  resetKey?: string | number
}

interface DeferredVisibilityResult<T extends HTMLElement> {
  ref: (element: T | null) => void
  isVisible: boolean
}

const DEFAULT_ROOT_MARGIN = '120px'

// Lightweight helper to delay hydration of expensive UI until the row is close to the viewport.
export function useDeferredVisibility<T extends HTMLElement>(
  options: DeferredVisibilityOptions = {},
): DeferredVisibilityResult<T> {
  const { rootMargin = DEFAULT_ROOT_MARGIN, resetKey } = options
  const [element, setElement] = useState<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (resetKey === undefined) {
      return
    }

    setIsVisible(false)
  }, [resetKey])

  useEffect(() => {
    if (isVisible || !element) {
      return undefined
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
        }
      },
      { rootMargin },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [element, isVisible, rootMargin])

  const ref = useCallback((node: T | null) => {
    setElement(node)
  }, [])

  return useMemo(() => ({ ref, isVisible }), [ref, isVisible])
}
