import React, { useMemo } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { baseTheme } from '@cowprotocol/ui'

import { CowSwapDefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

import { mapWidgetTheme } from './mapWidgetTheme'

// These values are static and don't change during runtime
const isWidget = isInjectedWidget()
const widgetMode = {
  isWidget,
  isIframe: isIframe(),
  // TODO: isInjectedWidgetMode is deprecated, use isWidget instead
  // This alias is kept for backward compatibility with styled components
  isInjectedWidgetMode: isWidget,
}

export function getCowswapTheme(darkmode: boolean, isWidget: boolean): CowSwapDefaultTheme {
  return {
    ...baseTheme(darkmode ? 'dark' : 'light'),
    isWidget,
  }
}

export function ThemeProvider({ children }: { children?: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()

  const themeObject = useMemo(() => {
    const defaultTheme = {
      ...getCowswapTheme(darkMode, widgetMode.isWidget),
      ...widgetMode,
    }

    if (widgetMode.isWidget) {
      return mapWidgetTheme(injectedWidgetTheme, defaultTheme)
    }

    return defaultTheme
  }, [darkMode, injectedWidgetTheme])

  return (
    <>
      <ThemeFromUrlUpdater />
      <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
    </>
  )
}
