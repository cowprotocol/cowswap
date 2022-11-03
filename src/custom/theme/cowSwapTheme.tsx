import React, { useMemo } from 'react'
import { css, DefaultTheme, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'

import { Colors } from 'theme/styled'
import {
  colors as colorsBaseTheme,
  FixedGlobalStyle as FixedGlobalStyleBase,
  ThemedGlobalStyle as ThemedGlobalStyleBase,
  themeVariables as baseThemeVariables,
} from 'theme/baseTheme'

import { getTheme, MEDIA_WIDTHS as MEDIA_WIDTHS_UNISWAP } from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'
// import { useLocation } from 'react-router-dom'

export { MEDIA_WIDTHS, ThemedText } from '@src/theme'

export function colors(darkMode: boolean): Colors {
  return colorsBaseTheme(darkMode)
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
    ...getTheme(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    mediaWidth: mediaWidthTemplates,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  // const location = useLocation()
  // const tradeTypeInfo = useTradeTypeInfo()

  const themeObject = useMemo(() => {
    // Page background must be blurred for all pages besides Swap page and Limit orders
    // const shouldBlurBackground = location.pathname.length > 1 && !tradeTypeInfo

    return theme(
      darkMode
      // shouldBlurBackground
    )
  }, [
    darkMode,
    // location.pathname,
    // tradeTypeInfo,
  ])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const FixedGlobalStyle = FixedGlobalStyleBase
export const ThemedGlobalStyle = ThemedGlobalStyleBase
