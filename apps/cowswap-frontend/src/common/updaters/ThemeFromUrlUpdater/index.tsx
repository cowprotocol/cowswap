import { useEffect, useRef } from 'react'

import { useLocation } from 'react-router'

import { useAppDispatch } from 'legacy/state/hooks'
import { useIsDarkMode } from 'legacy/state/user/hooks'
import { updateUserDarkMode } from 'legacy/state/user/reducer'

/**
 * Switch theme depending on theme query parameter
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ThemeFromUrlUpdater() {
  const darkMode = useIsDarkMode()
  const darkModeRef = useRef(darkMode)
  const dispatch = useAppDispatch()
  const { search } = useLocation()

  darkModeRef.current = darkMode

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const themeValue = searchParams.get('theme')

    if (!themeValue) return

    const isDarkMode = searchParams.get('theme') === 'dark'

    if (isDarkMode === darkModeRef.current) return

    dispatch(updateUserDarkMode({ userDarkMode: isDarkMode }))
  }, [search, dispatch])

  return null
}
