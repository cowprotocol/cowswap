import { useEffect } from 'react'

import { useAppDispatch } from 'legacy/state/hooks'
import { updateMatchesDarkMode } from 'legacy/state/user/reducer'

export function UserUpdater(): null {
  const dispatch = useAppDispatch()

  // keep dark mode in sync with the system
  useEffect(() => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const darkHandler = (match: MediaQueryListEvent) => {
      dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))
    }

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    dispatch(updateMatchesDarkMode({ matchesDarkMode: match.matches }))

    if (match?.addListener) {
      match?.addListener(darkHandler)
    } else if (match?.addEventListener) {
      match?.addEventListener('change', darkHandler)
    }

    return () => {
      if (match?.removeListener) {
        match?.removeListener(darkHandler)
      } else if (match?.removeEventListener) {
        match?.removeEventListener('change', darkHandler)
      }
    }
  }, [dispatch])

  return null
}
