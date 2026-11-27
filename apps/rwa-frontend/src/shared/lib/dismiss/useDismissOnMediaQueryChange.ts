import { useEffect } from 'react'

/** Closes an overlay that only belongs on one side of `mediaQuery` when the viewport crosses it */
export function useDismissOnMediaQueryChange(isOpen: boolean, mediaQuery: string, close: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    const query = window.matchMedia(mediaQuery)

    query.addEventListener('change', close)

    return () => query.removeEventListener('change', close)
  }, [isOpen, mediaQuery, close])
}
