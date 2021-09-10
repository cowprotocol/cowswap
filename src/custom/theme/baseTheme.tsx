import Logo from 'assets/svg/logo.svg'
import LogoDark from 'assets/svg/logo_white.svg'

import { Colors } from 'theme/styled'
import { colors as colorsUniswap } from '@src/theme'
import { ButtonSize } from 'theme'

import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import React, { useMemo } from 'react'

import { theme as themeUniswap } from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'
import { transparentize } from 'polished'

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
    yellow: '#fff6dc',
    greenShade: '#376c57',
    blueShade: '#0f2644',
    blueShade2: '#011e34',
    border: darkMode ? '#3a3b5a' : 'rgb(58 59 90 / 10%)',
    border2: darkMode ? '#254F83' : '#afcbda',
    disabled: darkMode ? '#31323e' : 'rgb(237, 238, 242)',
    redShade: darkMode ? '#842100' : '#AE2C00',
    textLink: darkMode ? '#ffffff' : '#AE2C00',
    shimmer1: darkMode ? 'rgb(22 56 97 / 20%)' : 'rgb(175 203 218 / 20%)',
    shimmer2: darkMode ? 'rgb(22 56 97 / 50%)' : 'rgb(175 203 218 / 40%)',

    // table styles
    tableHeadBG: darkMode ? '#021E34' : 'rgb(2 30 52 / 15%)',
    tableRowBG: darkMode ? 'rgb(0 30 52 / 60%)' : '#ffffff',

    // banner styles
    info: darkMode ? '#615845' : '#FFEDAF',
    infoText: darkMode ? '#ffca4a' : '#564D00',
    warning: '#FFEDAF',
    warningText: '#564D00',
    error: '#FFC7AF',
    errorText: '#560000',
  }
}

export function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    body: {
      background: css`
        background: radial-gradient(50% 50%, ${colorsTheme.primary1} 0%, ${colorsTheme.bg1} 100%) 0 -30vh no-repeat;
      `,
    },
    logo: { src: `${darkMode ? LogoDark : Logo}`, alt: 'GP Logo', width: '24px', height: 'auto' },
    appBody: {
      boxShadow: `0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
  0px 24px 32px rgba(0, 0, 0, 0.01)`,
      borderRadius: '30px',
      border: 'none',
      padding: '1rem',
      maxWidth: {
        normal: '420px',
        content: '620px',
      },
    },
    neumorphism: {
      boxShadow: css`
        box-shadow: inset 2px -2px 4px ${darkMode ? '#1d4373' : '#ffffff'},
          inset -2px 2px 4px ${darkMode ? '#021E34' : 'rgb(162 200 216)'};
      `,
    },
    header: {
      border: `1px solid ${colorsTheme.border}`,
      menuFlyout: {
        background: colorsTheme.bg3,
        color: colorsTheme.text2,
        colorHover: colorsTheme.text2,
        colorHoverBg: colorsTheme.bg3,
        closeButtonBg: colorsTheme.bg3,
        closeButtonColor: colorsTheme.black,
        seperatorColor: colorsTheme.disabled,
      },
    },
    buttonSizes: {
      [ButtonSize.BIG]: css`
        font-size: 26px;
        min-height: 60px;
      `,
      [ButtonSize.DEFAULT]: css`
        font-size: 16px;
      `,
      [ButtonSize.SMALL]: css`
        font-size: 12px;
      `,
    },
    swap: {
      headerSize: '28px',
      arrowDown: {
        background: darkMode ? colorsTheme.blueShade : colorsTheme.white,
        color: darkMode ? colorsTheme.white : colorsTheme.black,
        colorHover: darkMode ? colorsTheme.white : colorsTheme.black,
        borderRadius: '9px',
        width: '30px',
        height: '30px',
        borderColor: darkMode ? colorsTheme.blueShade2 : colorsTheme.disabled,
        borderSize: `2px`,
      },
    },
    buttonPrimary: {
      background: css`
        background: transparent linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
      `,
      fontWeight: '500',
      border: '0',
      borderRadius: '9px',
      boxShadow: 'none',
    },
    buttonOutlined: {
      background: css`
        background: transparent linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
      `,
      fontWeight: '500',
      border: '0',
      borderRadius: '9px',
      boxShadow: 'none',
    },
    buttonLight: {
      fontWeight: '500',
      border: 'none',
      borderHover: '1px solid transparent',
      boxShadow: 'none',
      backgroundHover: `${colorsTheme.primary4}`,
      borderRadius: '9px',
    },
    currencyInput: {
      background: `${colorsTheme.bg1}`,
      border: `1px solid ${colorsTheme.bg2}`,
    },
    buttonCurrencySelect: {
      background: `linear-gradient(270deg, ${colorsTheme.purple} 0%, ${colorsTheme.blue1} 100%)`,
      color: `${colorsTheme.white}`,
      colorSelected: `${colorsTheme.text1}`,
      boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    footerColor: colorsTheme.text1,
    networkCard: {
      background: 'rgba(243, 132, 30, 0.05)',
      text: colorsTheme.yellow2,
    },
    wallet: {
      color: colorsTheme.text1,
      background: colorsTheme.bg1,
    },
  }
}

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...themeVariables(darkmode, colorsTheme),
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const UniFixedGlobalStyle = css`
  html,
  input,
  textarea,
  button {
    font-family: 'Inter', sans-serif;
    font-display: fallback;
  }
  @supports (font-variation-settings: normal) {
    html,
    input,
    textarea,
    button {
      font-family: 'Inter var', sans-serif;
    }
  }
  html,
  body {
    margin: 0;
    padding: 0;
  }
  a {
    color: ${colors(false).blue1};
  }
  * {
    box-sizing: border-box;
  }
  button {
    user-select: none;
  }
  html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  }
`

// export const ThemedGlobalStyle = createGlobalStyle`
export const UniThemedGlobalStyle = css`
  html {
    color: ${({ theme }) => theme.text1};
    background-color: ${({ theme }) => theme.bg2};
  }
  body {
    min-height: 100vh;
    background-position: 0 -30vh;
    background-repeat: no-repeat;
    background-image: ${({ theme }) =>
      `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.9, theme.primary1)} 0%, ${transparentize(
        1,
        theme.bg1
      )} 100%)`};
  }
`

export const FixedGlobalStyle = createGlobalStyle`
  // Uni V2 theme mixin
  ${UniFixedGlobalStyle}
`

export const ThemedGlobalStyle = createGlobalStyle`
  // Uni V2 theme mixin
  ${UniThemedGlobalStyle}

  html {
    // Uniswap default
    color: ${({ theme }) => theme.text1};
    background-image: ${({ theme }) => `linear-gradient(0deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`};
  }

  *, *:after, *:before { box-sizing:border-box; }
`
