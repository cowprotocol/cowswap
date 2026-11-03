import { useEffect } from 'react'

let activeLocks = 0

/**
 * Locks the page scroll while `isLocked`, only when the viewport matches `mediaQuery`. The page stays locked until
 * every holder releases it
 */
export function useBodyScrollLock(isLocked: boolean, mediaQuery = 'all'): void {
  useEffect(() => {
    if (!isLocked) return

    const query = window.matchMedia(mediaQuery)
    let isHolding = false

    const update = (): void => {
      if (query.matches === isHolding) return

      isHolding = query.matches
      activeLocks += isHolding ? 1 : -1
      applyLocks()
    }

    update()
    query.addEventListener('change', update)

    return () => {
      query.removeEventListener('change', update)

      if (!isHolding) return

      activeLocks -= 1
      applyLocks()
    }
  }, [isLocked, mediaQuery])
}

function applyLocks(): void {
  document.body.style.overflow = activeLocks > 0 ? 'hidden' : ''
}
