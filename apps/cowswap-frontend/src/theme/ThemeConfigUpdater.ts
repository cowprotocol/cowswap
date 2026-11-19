import { useSetAtom } from 'jotai'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

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

  const paletteTheme = !isInjectedWidget() && customTheme === VICE_THEME ? customTheme : undefined
  const appliedPaletteTheme = useRef<CowSwapTheme | undefined>(undefined)

  const theme = useMemo(() => {
    const defaultTheme = getCowswapTheme(darkMode)

    if (isInjectedWidget()) return mapWidgetTheme(widgetTheme, defaultTheme)

    return paletteTheme ? { ...defaultTheme, ...VICE_THEME_PALETTE } : defaultTheme
  }, [darkMode, widgetTheme, paletteTheme])

  /**
   * A custom palette goes on, and comes off, before paint. Left to the passive effect below, it
   * lands a frame after the page scene it belongs to, which shows as a flash of the other colours.
   */
  useLayoutEffect(() => {
    if (appliedPaletteTheme.current === paletteTheme) return

    appliedPaletteTheme.current = paletteTheme
    setThemeConfig(theme)
  }, [paletteTheme, setThemeConfig, theme])

  useEffect(() => {
    setThemeConfig(theme)
  }, [setThemeConfig, theme])

  return null
}
