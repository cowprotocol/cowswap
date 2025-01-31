import React, { PropsWithChildren, useMemo } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { baseTheme } from '@cowprotocol/ui'

import { useLocation } from 'react-router-dom'
// eslint-disable-next-line no-restricted-imports
import { DefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts, getThemePalette } from './styles'

import { useThemeMode } from '../hooks/useThemeManager'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemeMode()
  const location = useLocation()

  const themeObject = useMemo(() => {
    const themePalette = getThemePalette(mode)
    const fontPalette = getFonts(mode)

    // Determine order type from URL path
    const isLimitOrder = location.pathname.includes('/limit')
    const isSwapOrder = location.pathname.includes('/swap')
    const isTwapOrder = location.pathname.includes('/twap')
    const isAdvancedOrder = location.pathname.includes('/advanced')

    // Determine widget mode
    const isWidget = isInjectedWidget()
    const isIframe = window.self !== window.top
    const isStandalone = !isWidget && !isIframe
    const isInjectedWidgetMode = isWidget

    const computedTheme: DefaultTheme = {
      ...baseTheme(mode),
      // Compute the app colour pallette using the passed in themeMode
      ...themePalette,
      ...fontPalette,
      // Add explorer-specific theme flags
      isInjectedWidgetMode,
      isStandalone,
      isWidget,
      isIframe,
      isLimitOrder,
      isSwapOrder,
      isTwapOrder,
      isAdvancedOrder,
    }

    return computedTheme
  }, [mode, location])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}
