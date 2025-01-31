import React, { useMemo } from 'react'

import { useWidgetMode } from '@cowprotocol/common-hooks'
import { baseTheme } from '@cowprotocol/ui'

import { CowSwapDefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

import { mapWidgetTheme } from './mapWidgetTheme'

export function getCowswapTheme(darkmode: boolean, isInjectedWidgetMode: boolean): CowSwapDefaultTheme {
  return {
    ...baseTheme(darkmode ? 'dark' : 'light'),
    isInjectedWidgetMode,
  }
}

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()
  const widgetMode = useWidgetMode()

  const themeObject = useMemo(() => {
    const defaultTheme = {
      ...getCowswapTheme(darkMode, widgetMode.isInjectedWidgetMode),
      ...widgetMode,
    }

    if (widgetMode.isWidget) {
      return mapWidgetTheme(injectedWidgetTheme, defaultTheme)
    }

    return defaultTheme
  }, [darkMode, injectedWidgetTheme, widgetMode])

  return (
    <>
      <ThemeFromUrlUpdater />
      <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
    </>
  )
}
