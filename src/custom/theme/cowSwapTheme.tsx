import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import React, { useMemo } from 'react'
import Cursor1 from 'assets/cow-swap/cursor1.gif'
import Cursor2 from 'assets/cow-swap/cursor2.gif'
import Cursor3 from 'assets/cow-swap/cursor3.gif'
import Cursor4 from 'assets/cow-swap/cursor4.gif'

import { Colors } from 'theme/styled'
import { colors as colorsBaseTheme, themeVariables as baseThemeVariables } from 'theme/baseTheme'

import {
  theme as themeUniswap,
  FixedGlobalStyle as FixedGlobalStyleUniswap,
  ThemedGlobalStyle as ThemedGlobalStyleUniswap
} from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'
import { cowSwapBackground, cowSwapLogo } from './cowSwapAssets'

// Modal override items
import { HeaderText } from '@src/components/WalletModal/Option'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { ModalContentWrapper } from 'components/Settings/SettingsMod'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsBaseTheme(darkMode),

    // ****** base ******
    white: darkMode ? '#c5daef' : '#ffffff',
    black: darkMode ? '#021E34' : '#000000',

    // ****** text ******
    text1: darkMode ? '#c5daef' : '#000000',
    text2: darkMode ? '#021E34' : '#000000',
    text3: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#000000',
    text4: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#000000b8',

    // ****** backgrounds / greys ******
    bg1: darkMode ? '#163861' : '#D5E9F0',
    bg2: darkMode ? '#c5daef' : '#ffffff',
    bg3: darkMode ? '#163861' : '#d5e8f0',
    bg4: darkMode ? '#021E34' : '#ffffff',
    bg5: darkMode ? '#1d4373' : '#D5E9F0',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#163861' : '#d5e8f0',

    // ****** primary colors ******
    primary1: darkMode ? '#e47651' : '#FF784A',
    primary3: darkMode ? '#e47651' : '#FF784A',
    primary4: darkMode ? '#ff5d25' : '#ff5d25',
    primary5: darkMode ? '#e47651' : '#FF784A',

    // ****** color text ******
    primaryText1: darkMode ? '#021E34' : '#000000',

    // ****** secondary colors ******
    secondary1: darkMode ? '#2172E5' : '#8958FF',
    secondary3: darkMode ? '#17000b26' : 'rgba(137,88,255,0.6)',

    // ****** other ******
    border: darkMode ? '#021E34' : '#000000',
    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#afcbda'
  }
}

function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    logo: {
      src: `data:image/svg+xml;base64,${cowSwapLogo(darkMode)}`,
      alt: 'CowSwap Logo',
      width: '208px',
      height: '50px'
    },
    cursor: css`
      cursor: url(${Cursor1}), auto;
      animation: cursor 1s infinite;
      @keyframes cursor {
        0% {
          cursor: url(${Cursor1}), auto;
        }
        25% {
          cursor: url(${Cursor2}), auto;
        }
        50% {
          cursor: url(${Cursor3}), auto;
        }
        75% {
          cursor: url(${Cursor4}), auto;
        }
      }
    `,
    body: {
      background: css`
        background: rgba(164, 211, 227, 1);
        transition: background-color 2s ease-in-out, background-image 2s ease-in-out;
        background: url(data:image/svg+xml;base64,${cowSwapBackground(darkMode)}) no-repeat 100% / cover fixed,
          ${
            darkMode
              ? 'linear-gradient(180deg,rgba(20, 45, 78, 1) 10%, rgba(22, 58, 100, 1) 30%)'
              : 'linear-gradient(180deg,rgba(164, 211, 227, 1) 5%, rgba(255, 255, 255, 1) 40%)'
          };
        background-attachment: fixed;
      `
    },
    appBody: {
      boxShadow: `4px 4px 0px ${colorsTheme.black}`,
      borderRadius: '16px',
      border: `3px solid ${colorsTheme.black}`,
      padding: '12px 6px',
      maxWidth: {
        normal: '460px',
        content: '680px'
      }
    },
    header: {
      border: 'none',
      menuFlyout: {
        background: 'transparent',
        color: darkMode ? colorsTheme.text1 : colorsTheme.text2,
        colorHover: darkMode ? colorsTheme.text1 : colorsTheme.text2,
        colorHoverBg: darkMode ? colorsTheme.black : colorsTheme.disabled,
        closeButtonBg: darkMode ? colorsTheme.white : colorsTheme.disabled,
        closeButtonColor: colorsTheme.black,
        seperatorColor: colorsTheme.disabled
      }
    },
    buttonPrimary: {
      background: css`
        background: ${colorsTheme.primary1};
        color: ${colorsTheme.black};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '16px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    buttonOutlined: {
      background: css`
        background: ${colorsTheme.bg1};
        color: ${colorsTheme.text1};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '16px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    buttonLight: {
      backgroundHover: colorsTheme.primary4,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    currencyInput: {
      background: `${darkMode ? colorsTheme.blueShade : colorsTheme.white}`,
      color: colorsTheme.text1,
      border: `2px solid ${darkMode ? colorsTheme.blueShade2 : colorsTheme.disabled}`
    },
    buttonCurrencySelect: {
      background: colorsTheme.bg1,
      border: `2px solid ${colorsTheme.black}`,
      boxShadow: `2px 2px 0px ${colorsTheme.black}`,
      color: darkMode ? colorsTheme.text2 : colorsTheme.text1,
      colorSelected: darkMode ? colorsTheme.white : colorsTheme.text1
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    footerColor: darkMode ? colorsTheme.text1 : colorsTheme.greenShade,
    networkCard: {
      background: 'rgb(255 120 74 / 60%)',
      text: colorsTheme.text1
    },
    wallet: {
      color: darkMode ? colorsTheme.text2 : colorsTheme.text1,
      background: darkMode ? colorsTheme.white : colorsTheme.bg2
    }
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

  // Custom
  html {
    color: ${({ theme }) => theme.text1};
    ${({ theme }) => theme.body.background}
  }
  body {
    background-position: initial;
    background-repeat: no-repeat;
    background-image: initial;
  }

  ::selection { 
    background: ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.text1};
  }

  // START - Modal overrides
  ${HeaderText} {
    color: ${({ theme }) => theme.text2};
  }

  ${ModalContentWrapper} {
    ${RowBetween} > div,
    ${AutoColumn} > div {
      color: ${({ theme }) => theme.text2};
    }
  }

  // END - Modal overrides
`
