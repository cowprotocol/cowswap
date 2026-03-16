import { useEffect } from 'react'

import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

import { useMediaQuery } from './useMediaQuery'

export function useBodyScrollbarLocker(isActive: boolean, query?: string): boolean {
  const matchesMediaQuery = useMediaQuery(query || '')
  const isBodyScrollbarLocked = isActive && (!query || matchesMediaQuery)

  useEffect(() => {
    if (isBodyScrollbarLocked) {
      addBodyClass('noScroll')
    } else {
      removeBodyClass('noScroll')
    }

    return () => {
      removeBodyClass('noScroll')
    }
  }, [isBodyScrollbarLocked])

  return isBodyScrollbarLocked
}
