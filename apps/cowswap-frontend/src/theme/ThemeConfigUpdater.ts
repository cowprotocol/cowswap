import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { getCowswapTheme } from './getCowswapTheme'
import { mapWidgetTheme } from './mapWidgetTheme'
import { themeConfigAtom } from './themeConfigAtom'

import { useIsDarkMode } from '../legacy/state/user/hooks'
import { useInjectedWidgetPalette } from '../modules/injectedWidget'

export function ThemeConfigUpdater(): null {
  const setThemeConfig = useSetAtom(themeConfigAtom)

  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()

  useEffect(() => {
    const defaultTheme = getCowswapTheme(darkMode)

    if (isInjectedWidget()) {
      setThemeConfig(mapWidgetTheme(injectedWidgetTheme, defaultTheme))
    } else {
      setThemeConfig(defaultTheme)
    }
  }, [setThemeConfig, darkMode, injectedWidgetTheme])

  return null
}
