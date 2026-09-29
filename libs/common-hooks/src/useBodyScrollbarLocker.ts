import { useLayoutEffect } from 'react'

import { acquireBodyScrollbarLock, releaseBodyScrollbarLock } from './bodyScrollbarLock'
import { useMediaQuery } from './useMediaQuery'

export function useBodyScrollbarLocker(isActive: boolean, query?: string): boolean {
  const matchesMediaQuery = useMediaQuery(query || '')
  const isBodyScrollbarLocked = isActive && (!query || matchesMediaQuery)

  useLayoutEffect(() => {
    if (!isBodyScrollbarLocked) {
      return
    }

    acquireBodyScrollbarLock()

    return () => {
      releaseBodyScrollbarLock()
    }
  }, [isBodyScrollbarLocked])

  return isBodyScrollbarLocked
}
