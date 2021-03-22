import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import React, { useMemo } from 'react'

import { Colors } from 'theme/styled'
import { colors as colorsBaseTheme, themeVariables as baseThemeVariables } from 'theme/baseTheme'

import {
  theme as themeUniswap,
  FixedGlobalStyle as FixedGlobalStyleUniswap,
  ThemedGlobalStyle as ThemedGlobalStyleUniswap
} from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsBaseTheme(darkMode)
  }
}

function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    body: {
      background: css`
        background: radial-gradient(50% 50%, ${colorsTheme.primary1} 0%, ${colorsTheme.bg1} 100%) 0 -30vh no-repeat;
      `
    },
    appBody: {
      boxShadow: `0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
  0px 24px 32px rgba(0, 0, 0, 0.01)`,
      borderRadius: '30px',
      border: 'none',
      padding: '1rem'
    },
    buttonPrimary: {
      background: css`
        background: transparent linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
      `
    },
    buttonLight: {
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      borderHover: '1px solid transparent',
      boxShadow: 'none'
    },
    currencyInput: {
      background: `${colorsTheme.bg1}`,
      border: `1px solid ${colorsTheme.bg2}`
    },
    buttonCurrencySelect: {
      background: `linear-gradient(270deg, ${colorsTheme.purple} 0%, ${colorsTheme.blue1} 100%)`,
      color: `${colorsTheme.white}`,
      colorSelected: `${colorsTheme.text1}`,
      boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)'
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    version: colorsTheme.green1
  }
}

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    ...themeVariables(darkmode, colorsTheme)
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const FixedGlobalStyle = createGlobalStyle`
  // Uniswap default
  ${FixedGlobalStyleUniswap}
`

export const ThemedGlobalStyle = createGlobalStyle`
  // Uniswap default
  ${ThemedGlobalStyleUniswap}

  html {
    background-image: ${({ theme }) => `linear-gradient(0deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`};
  }
`
