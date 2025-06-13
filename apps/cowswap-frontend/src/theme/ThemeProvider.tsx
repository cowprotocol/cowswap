import { ReactNode, useMemo } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { baseTheme } from '@cowprotocol/ui'

import { ThemeProvider as StyledComponentsThemeProvider, DefaultTheme } from 'styled-components'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useInjectedWidgetPalette } from 'modules/injectedWidget'

import { ThemeFromUrlUpdater } from 'common/updaters/ThemeFromUrlUpdater'

import { mapWidgetTheme } from './mapWidgetTheme'
import { ThemedGlobalStyle } from './ThemedGlobalStyle'

import { CustomGlobalStyles } from '../styles/CustomGlobalStyles'

// These values are static and don't change during runtime
const isWidget = isInjectedWidget()
const widgetMode = {
  isWidget,
  isIframe: isIframe(),
  // TODO: isInjectedWidgetMode is deprecated, use isWidget instead
  // This alias is kept for backward compatibility with styled components
  isInjectedWidgetMode: isWidget,
}

export function getCowswapTheme(darkmode: boolean): DefaultTheme {
  return {
    ...baseTheme(darkmode ? 'dark' : 'light'),
    ...widgetMode,
  }
}

export function ThemeProvider({ children }: { children?: ReactNode }): ReactNode {
  const darkMode = useIsDarkMode()
  const injectedWidgetTheme = useInjectedWidgetPalette()

  const themeObject = useMemo(() => {
    const defaultTheme = getCowswapTheme(darkMode)

    if (widgetMode.isWidget) {
      return mapWidgetTheme(injectedWidgetTheme, defaultTheme)
    }

    return defaultTheme
  }, [darkMode, injectedWidgetTheme])

  return (
    <>
      <CustomGlobalStyles />
      <ThemeFromUrlUpdater />
      <StyledComponentsThemeProvider theme={themeObject}>
        <ThemedGlobalStyle />
        {children}
      </StyledComponentsThemeProvider>
    </>
  )
}
