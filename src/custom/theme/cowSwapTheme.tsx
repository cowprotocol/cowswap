import React, { useMemo } from 'react'
import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, css } from 'styled-components/macro'

import { Colors } from 'theme/styled'
import {
  colors as colorsBaseTheme,
  themeVariables as baseThemeVariables,
  FixedGlobalStyle as FixedGlobalStyleBase,
  ThemedGlobalStyle as ThemedGlobalStyleBase,
} from 'theme/baseTheme'

import { theme as themeUniswap, MEDIA_WIDTHS as MEDIA_WIDTHS_UNISWAP } from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'

export { TYPE, MEDIA_WIDTHS } from '@src/theme'
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

const MEDIA_WIDTHS = {
  ...MEDIA_WIDTHS_UNISWAP,
  upToVerySmall: 500,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    ...themeVariables(darkmode, colorsTheme),
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const FixedGlobalStyle = FixedGlobalStyleBase
export const ThemedGlobalStyle = ThemedGlobalStyleBase
