import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import type { CowSwapTheme } from '@cowprotocol/ui'
import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { getCowswapTheme } from './getCowswapTheme'
import { mapWidgetTheme } from './mapWidgetTheme'
import { themeConfigAtom } from './themeConfigAtom'
import { VICE_THEME, VICE_THEME_PALETTE } from './viceTheme.constants'

import { useIsDarkMode } from '../legacy/state/user/hooks'
import { useInjectedWidgetPalette } from '../modules/injectedWidget'

interface ThemeConfigUpdaterProps {
  customTheme?: CowSwapTheme
}

export function ThemeConfigUpdater({ customTheme }: ThemeConfigUpdaterProps = {}): null {
  const setThemeConfig = useSetAtom(themeConfigAtom)

  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()
  const [widgetTheme, setWidgetTheme] = useState<Partial<CowSwapWidgetPalette> | undefined>(() =>
    injectedWidgetTheme && typeof injectedWidgetTheme === 'object' ? injectedWidgetTheme : undefined,
  )

  /**
   * Sync widgetTheme from URL when the host sends a palette or an explicit reset (`palette=null`).
   */
  useEffect(() => {
    if (injectedWidgetTheme === undefined) {
      return
    }

    setWidgetTheme(injectedWidgetTheme ?? undefined)
  }, [injectedWidgetTheme])

  useEffect(() => {
    const defaultTheme = getCowswapTheme(darkMode)

    if (isInjectedWidget()) {
      setThemeConfig(mapWidgetTheme(widgetTheme, defaultTheme))
    } else {
      setThemeConfig(customTheme === VICE_THEME ? { ...defaultTheme, ...VICE_THEME_PALETTE } : defaultTheme)
    }
  }, [setThemeConfig, darkMode, widgetTheme, customTheme])

  return null
}
