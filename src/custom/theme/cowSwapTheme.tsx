import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'
import React, { useMemo } from 'react'

import { Colors } from 'theme/styled'
import {
  colors as colorsBaseTheme,
  themeVariables as baseThemeVariables,
  FixedGlobalStyle as FixedGlobalStyleBase,
  ThemedGlobalStyle as ThemedGlobalStyleBase,
} from 'theme/baseTheme'

import { theme as themeUniswap } from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsBaseTheme(darkMode),
  }
}

function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    ...baseThemeVariables(darkMode, colorsTheme),
  }
}

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    ...themeVariables(darkmode, colorsTheme),
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const FixedGlobalStyle = FixedGlobalStyleBase
export const ThemedGlobalStyle = ThemedGlobalStyleBase
