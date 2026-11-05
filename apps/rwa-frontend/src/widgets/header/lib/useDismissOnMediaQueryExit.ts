import { useEffect } from 'react'

/** Calls `close` when the viewport stops matching `mediaQuery` while `isOpen`, so the overlay can't reappear later */
export function useDismissOnMediaQueryExit(isOpen: boolean, mediaQuery: string, close: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    const query = window.matchMedia(mediaQuery)
    const onChange = (): void => {
      if (!query.matches) close()
    }

    query.addEventListener('change', onChange)

    return () => query.removeEventListener('change', onChange)
  }, [isOpen, mediaQuery, close])
}
