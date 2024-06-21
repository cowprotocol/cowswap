import React, { PropsWithChildren, useMemo } from 'react'

import { baseTheme } from '@cowprotocol/ui'

// eslint-disable-next-line no-restricted-imports
import { DefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts, getThemePalette } from './styles'

import { useThemeMode } from '../hooks/useThemeManager'

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
    }

    return computedTheme
  }, [mode])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}
