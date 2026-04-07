import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

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
  const [widgetTheme, setWidgetTheme] = useState(injectedWidgetTheme)

  /**
   * Save widgetTheme from URL to state only if it's present
   */
  useEffect(() => {
    if (injectedWidgetTheme) {
      setWidgetTheme(injectedWidgetTheme)
    }
  }, [injectedWidgetTheme])

  useEffect(() => {
    const defaultTheme = getCowswapTheme(darkMode)

    if (isInjectedWidget()) {
      setThemeConfig(mapWidgetTheme(widgetTheme, defaultTheme))
    } else {
      setThemeConfig(defaultTheme)
    }
  }, [setThemeConfig, darkMode, widgetTheme])

  return null
}
