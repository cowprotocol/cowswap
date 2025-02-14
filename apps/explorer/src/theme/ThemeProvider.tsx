import React, { PropsWithChildren, useMemo } from 'react'

import { baseTheme } from '@cowprotocol/ui'

// eslint-disable-next-line no-restricted-imports
import { DefaultTheme } from 'styled-components'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { getFonts } from './styles'

import { useThemeMode } from '../hooks/useThemeManager'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemeMode()

  const themeObject = useMemo(() => {
    const fontPalette = getFonts(mode)

    const computedTheme: DefaultTheme = {
      ...baseTheme(mode),
      mode,
      ...fontPalette,
    }

    return computedTheme
  }, [mode])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}
