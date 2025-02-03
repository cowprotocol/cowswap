import React, { PropsWithChildren, useMemo } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { baseTheme } from '@cowprotocol/ui'

// eslint-disable-next-line no-restricted-imports
import { DefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts, getThemePalette } from './styles'

import { useThemeMode } from '../hooks/useThemeManager'

// These values are static and don't change during runtime
const isWidget = isInjectedWidget()
const widgetMode = {
  isWidget,
  isIframe: isIframe(),
  // TODO: isInjectedWidgetMode is deprecated, use isWidget instead
  // This alias is kept for backward compatibility with styled components
  isInjectedWidgetMode: isWidget,
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemeMode()

  const themeObject = useMemo(() => {
    const themePalette = getThemePalette(mode)
    const fontPalette = getFonts(mode)

    const computedTheme: DefaultTheme = {
      ...baseTheme(mode),
      // Compute the app colour pallette using the passed in themeMode
      ...themePalette,
      ...fontPalette,
      // Add widget mode flags
      ...widgetMode,
    }

    return computedTheme
  }, [mode])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}
