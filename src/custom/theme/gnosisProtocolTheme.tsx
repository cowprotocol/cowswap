import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import React, { useMemo } from 'react'

import Logo from 'assets/svg/logo.svg'
import LogoDark from 'assets/svg/logo_white.svg'

import { Colors } from 'theme/styled'
import {
  colors as colorsUniswap,
  theme as themeUniswap,
  FixedGlobalStyle as FixedGlobalStyleUniswap,
  ThemedGlobalStyle as ThemedGlobalStyleUniswap
} from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsUniswap(darkMode),

    // ****** base ******

    // ****** text ******
    text2: darkMode ? '#DCDCDC' : '#565A69',

    // ****** backgrounds / greys ******
    bg1: darkMode ? '#1E1F2C' : '#FFFFFF',
    bg2: darkMode ? '#2C2D3F' : '#F7F8FA',
    bg3: darkMode ? '#1E1F2C' : '#EDEEF2',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#2B2D3F' : 'rgb(247 248 250)',

    // ****** primary colors ******
    primary1: darkMode ? '#3F77FF' : '#8958FF',
    primary5: darkMode ? '#153d6f70' : 'rgba(137,88,255,0.6)',

    // ****** color text ******
    primaryText1: darkMode ? '#6da8ff' : '#8958FF',

    // ****** secondary colors ******
    secondary1: darkMode ? '#2172E5' : '#8958FF',
    // secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : 'rgba(137,88,255,0.6)',

    // ****** other ******
    blue1: '#3F77FF',
    purple: '#8958FF',
    border: darkMode ? '#3a3b5a' : 'rgb(58 59 90 / 10%)',
    disabled: darkMode ? '#31323e' : 'rgb(237, 238, 242)'
  }
}

function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    logo: { src: `${darkMode ? LogoDark : Logo}`, alt: 'GP Logo', width: '24px', height: 'auto' },
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
    header: {
      border: `1px solid ${colorsTheme.border}`
    },
    buttonPrimary: {
      background: css`
        background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
        background-color: transparent;
      `
    },
    buttonLight: {
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      borderHover: '1px solid transparent',
      borderRadius: 'inherit',
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
    `
  }
}

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
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
