import { Colors } from 'theme/styled'
import { colors as colorsUniswap } from '@src/theme'
import { ButtonSize } from 'theme'

import { createGlobalStyle, css } from 'styled-components/macro'

import { transparentize } from 'polished'
import { cowSwapBackground, cowSwapLogo } from 'theme/cowSwapAssets'

import Cursor1 from 'assets/cow-swap/cursor1.gif'
import Cursor2 from 'assets/cow-swap/cursor2.gif'
import Cursor3 from 'assets/cow-swap/cursor3.gif'
import Cursor4 from 'assets/cow-swap/cursor4.gif'

// Modal override items
import { HeaderText } from '@src/components/WalletModal/Option'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { ModalContentWrapper } from 'components/Settings/SettingsMod'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsUniswap(darkMode),

    // ****** base ******
    white: darkMode ? '#c5daef' : '#ffffff',
    black: darkMode ? '#021E34' : '#000000',

    // ****** text ******
    text1: darkMode ? '#c5daef' : '#000000',
    text2: darkMode ? '#021E34' : '#000000',
    text3: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#000000',
    text4: darkMode ? 'rgba(197, 218, 239, 0.7)' : '#000000b8',

    // ****** backgrounds / greys ******
    bg1: darkMode ? '#163861' : '#D5E9F0',
    bg2: darkMode ? '#c5daef' : '#ffffff',
    bg3: darkMode ? '#163861' : '#d5e8f0',
    bg4: darkMode ? '#021E34' : '#ffffff',
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg6: darkMode ? '#163861' : '#b0dfee',
    bg7: darkMode ? '#1F4471' : '#CEE7EF',
    bg8: darkMode ? '#021E34' : '#152943',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#163861' : '#d5e8f0',

    // ****** primary colors ******
    primary1: darkMode ? '#D67B5A' : '#FF784A',
    primary3: darkMode ? '#D67B5A' : '#FF784A',
    primary4: darkMode ? '#ff5d25' : '#ff5d25',
    primary5: darkMode ? '#D67B5A' : '#FF784A',

    // ****** color text ******
    primaryText1: darkMode ? '#021E34' : '#000000',

    // ****** secondary colors ******
    secondary1: darkMode ? '#2172E5' : '#8958FF',
    secondary3: darkMode ? '#17000b26' : 'rgba(137,88,255,0.6)',

    // ****** other ******
    blue1: '#3F77FF',
    blue2: darkMode ? '#a3beff' : '#0c40bf',
    purple: '#8958FF',
    yellow: '#fff6dc',
    greenShade: '#376c57',
    blueShade: '#0f2644',
    blueShade2: '#011e34',
    blueShade3: darkMode ? '#1c416e' : '#bdd6e1',

    // states
    success: darkMode ? '#00d897' : '#00815a',
    danger: darkMode ? '#f7a7a7' : '#8f0000',
    pending: '#43758C',
    attention: '#ff5722',

    // ****** other ******
    border: darkMode ? '#021E34' : '#000000',
    border2: darkMode ? '#254F83' : '#afcbda',
    cardBorder: darkMode ? '#021E34' : 'rgba(255, 255, 255, 0.5)',
    cardShadow1: darkMode ? '#4C7487' : '#FFFFFF',
    cardShadow2: darkMode ? 'rgba(1, 10, 16, 0.15)' : 'rgba(11, 37, 53, 0.93)',

    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#afcbda',
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
        background: rgba(164, 211, 227, 1);
        background: url(data:image/svg+xml;base64,${cowSwapBackground(darkMode)}) no-repeat 100% / cover fixed,
          ${darkMode
            ? 'linear-gradient(180deg,rgba(20, 45, 78, 1) 10%, rgba(22, 58, 100, 1) 30%)'
            : 'linear-gradient(180deg,rgba(164, 211, 227, 1) 5%, rgba(255, 255, 255, 1) 40%)'};
        background-attachment: fixed;
        backdrop-filter: blur(40px);
      `,
    },
    logo: {
      src: `data:image/svg+xml;base64,${cowSwapLogo(darkMode)}`,
      srcIcon: `data:image/svg+xml;base64,${cowSwapLogo(darkMode, true)}`,
      alt: 'CowSwap Logo',
      width: '208px',
      height: '50px',
    },
    util: {
      invertImageForDarkMode: darkMode ? 'filter: invert(1) grayscale(1);' : null,
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
    appBody: {
      boxShadow: `4px 4px 0px ${colorsTheme.black}`,
      borderRadius: '16px',
      border: `3px solid ${colorsTheme.black}`,
      padding: '12px 6px',
      maxWidth: {
        normal: '460px',
        content: '680px',
      },
    },
    neumorphism: {
      boxShadow: css`
        box-shadow: inset 2px -2px 4px ${darkMode ? '#1d4373' : '#ffffff'},
          inset -2px 2px 4px ${darkMode ? '#021E34' : 'rgb(162 200 216)'};
      `,
    },
    cowToken: {
      background: css`
        background: linear-gradient(70.89deg, #292a30 10.71%, #101015 33%, #0e0501 88.54%);
      `,
      boxShadow: css`
        box-shadow: inset 1px 0px 1px -1px hsla(0, 0%, 100%, 0.4);
      `,
    },
    card: {
      background: css`
        background: linear-gradient(145deg, ${colorsTheme.bg3}, ${colorsTheme.bg4});
      `,
      background2: darkMode ? '#01182a' : colorsTheme.bg3,
      background3: css`
        background: ${darkMode ? '#0f2644' : '#ffffff'};
      `,
      border: `${darkMode ? 'rgb(197 218 239 / 10%)' : 'rgb(16 42 72 / 20%)'}`,
      boxShadow: css`
        background: linear-gradient(145deg, ${colorsTheme.bg3}, ${colorsTheme.bg4});
        box-shadow: inset 0 1px 1px 0 hsl(0deg 0% 100% / 10%), 0 10px 40px -20px #000000;
      `,
    },
    iconGradientBorder: css`
      background: conic-gradient(${colorsTheme.bg3} 40grad, 80grad, ${colorsTheme.primary1} 360grad);
    `,
    header: {
      border: 'none',
      menuFlyout: {
        background: 'transparent',
        color: darkMode ? colorsTheme.text1 : colorsTheme.text2,
        colorHover: darkMode ? colorsTheme.text1 : colorsTheme.text2,
        colorHoverBg: darkMode ? colorsTheme.black : colorsTheme.disabled,
        closeButtonBg: darkMode ? colorsTheme.white : colorsTheme.disabled,
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
        background: ${colorsTheme.primary1};
        color: ${colorsTheme.black};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '16px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`,
    },
    buttonOutlined: {
      background: css`
        background: ${colorsTheme.bg1};
        color: ${colorsTheme.text1};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '16px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`,
    },
    buttonLight: {
      backgroundHover: colorsTheme.primary4,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      boxShadow: `4px 4px 0px ${colorsTheme.black}`,
    },
    currencyInput: {
      background: `${darkMode ? colorsTheme.blueShade : colorsTheme.white}`,
      color: colorsTheme.text1,
      border: `2px solid ${darkMode ? colorsTheme.blueShade2 : colorsTheme.disabled}`,
    },
    buttonCurrencySelect: {
      background: colorsTheme.bg1,
      border: `2px solid ${colorsTheme.black}`,
      boxShadow: `2px 2px 0px ${colorsTheme.black}`,
      color: darkMode ? colorsTheme.text2 : colorsTheme.text1,
      colorSelected: darkMode ? colorsTheme.white : colorsTheme.text1,
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    footerColor: darkMode ? colorsTheme.text1 : colorsTheme.greenShade,
    networkCard: {
      background: 'rgb(255 120 74 / 60%)',
      text: colorsTheme.black,
    },
    wallet: {
      color: darkMode ? colorsTheme.text2 : colorsTheme.text1,
      background: darkMode ? colorsTheme.white : colorsTheme.bg2,
    },
  }
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
    color: ${({ theme }) => theme.text1};
    ${({ theme }) => theme.body.background}
  }

  *, *:after, *:before { box-sizing:border-box; }

  body {
    background-position: initial;
    background-repeat: no-repeat;
    background-image: initial;

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection { 
    background: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.text2};
  }

  // START - Modal overrides
  ${HeaderText} {
    color: ${({ theme }) => theme.text1};
  }

  ${ModalContentWrapper} {
    ${RowBetween} > div,
    ${AutoColumn} > div {
      color: ${({ theme }) => theme.text2};
    }
  }
  // END - Modal overrides

`
