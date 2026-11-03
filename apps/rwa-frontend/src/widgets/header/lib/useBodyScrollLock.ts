import { useEffect } from 'react'

/** Locks the page scroll while `isLocked`, only when the viewport matches `mediaQuery` */
export function useBodyScrollLock(isLocked: boolean, mediaQuery = 'all'): void {
  useEffect(() => {
    if (!isLocked) return

    const query = window.matchMedia(mediaQuery)
    const apply = (): void => {
      document.body.style.overflow = query.matches ? 'hidden' : ''
    }

    apply()
    query.addEventListener('change', apply)

    return () => {
      query.removeEventListener('change', apply)
      document.body.style.overflow = ''
    }
  }, [isLocked, mediaQuery])
}
