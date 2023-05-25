import { Colors } from 'legacy/theme/styled'
import { ButtonSize } from 'legacy/theme/enum'
import { createGlobalStyle, css } from 'styled-components/macro'
import { transparentize, lighten } from 'polished'
import { colorsUniswap } from 'legacy/theme/colorsUniswap'
import Cursor1 from 'legacy/assets/cow-swap/cursor1.gif'
import Cursor2 from 'legacy/assets/cow-swap/cursor2.gif'
import Cursor3 from 'legacy/assets/cow-swap/cursor3.gif'
import Cursor4 from 'legacy/assets/cow-swap/cursor4.gif'

// TODO: This shouldn't be in the base theme
// Modal override items
// import { HeaderText } from 'legacy/components/WalletModal/Option'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsUniswap(darkMode),

    // CoW Swap V2 colors ======================
    white: darkMode ? '#CAE9FF' : '#ffffff',
    black: '#07162D',
    blueDark1: '#07162D',
    blueDark2: '#052B65',
    blueLight1: '#CAE9FF',
    grey1: darkMode ? '#07162D' : '#ECF1F8',

    bg1: darkMode ? '#0c264b' : '#ffffff',
    bg2: darkMode ? '#0d5ed9' : '#052B65',

    text1: darkMode ? '#CAE9FF' : '#052B65',
    text2: darkMode ? '#86B2DC' : '#506B93',
    text3: darkMode ? '#428dff' : '#0d5ed9',

    // States NEW
    danger: darkMode ? '#EB3030' : '#D41300',
    warning: darkMode ? '#ED6237' : '#D94719',
    alert: darkMode ? '#DB971E' : '#DB971E',
    information: darkMode ? '#428dff' : '#0d5ed9',
    success: darkMode ? '#00D897' : '#007B28',
    pending: '#43758C', // deprecate
    attention: '#ff5722', // deprecate

    // DEPRECATED but keeping because of dependencies
    bg3: darkMode ? '#07162D' : '#ECF1F8',
    primary1: darkMode ? '#0d5ed9' : '#052B65',
    primary3: darkMode ? '#0d5ed9' : '#052B65',
    primary4: darkMode ? '#0d5ed9' : '#052B65',
    primary5: darkMode ? '#0d5ed9' : '#052B65',
    red1: darkMode ? '#EB3030' : '#D41300',
    error: darkMode ? '#EB3030' : '#D41300',
    // ==========================================

    // ****** text ******
    text4: darkMode ? 'rgba(197, 218, 239, 0.7)' : '#000000b8',

    // ****** backgrounds ******
    bg4: darkMode ? '#021E34' : '#ffffff',
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg6: darkMode ? '#163861' : '#b0dfee',
    bg7: darkMode ? '#1F4471' : '#CEE7EF',
    bg8: darkMode ? '#021E34' : '#152943',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#163861' : '#d5e8f0',

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
    yellow1: darkMode ? '#ebd6a2' : '#ffc107',
    orange: '#FF784A',
    greenShade: '#376c57',
    blueShade: '#0f2644',
    blueShade2: '#011e34',
    blueShade3: darkMode ? '#1c416e' : '#bdd6e1',

    // ****** other ******
    border: darkMode ? '#021E34' : '#000000',
    border2: darkMode ? '#254F83' : '#afcbda',
    cardBackground: darkMode ? '#142642' : 'rgb(255 255 255 / 85%)',
    cardBorder: darkMode ? '#021E34' : 'rgba(255, 255, 255, 0.5)',
    cardShadow1: darkMode ? '#4C7487' : '#FFFFFF',
    cardShadow2: darkMode ? 'rgba(1, 10, 16, 0.15)' : 'rgba(11, 37, 53, 0.93)',

    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#afcbda',
    redShade: darkMode ? '#842100' : '#AE2C00',
    textLink: darkMode ? '#ffffff' : '#AE2C00',
    scrollbarBg: darkMode ? '#01182a' : '#d5e8f0',
    scrollbarThumb: darkMode ? '#152c3e' : '#adc2ce',

    // table styles
    tableHeadBG: darkMode ? '#021E34' : 'rgb(2 30 52 / 15%)',
    tableRowBG: darkMode ? 'rgb(0 30 52 / 60%)' : '#ffffff',

    // banner styles
    info: darkMode ? '#615845' : '#FFEDAF',
    infoText: darkMode ? '#ffca4a' : '#564D00',
    warningText: '#564D00',
    errorText: '#b91515',
  }
}

export function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    body: {
      background: css`
        ${darkMode
          ? `
          background-color: ${colorsTheme.blueDark1};
          background-image: radial-gradient(50% 500px at 50% -6%, hsl(216deg 100% 20% / 70%) 0%, #071832 50%, #06162d 100%),radial-gradient(circle at -70% 50%, hsla(215,100%,20%,0.7) 0, transparent 50%);`
          : `background: linear-gradient(45deg, #EAE9FF 14.64%, ${colorsTheme.blueLight1} 85.36%)`};
        background-attachment: fixed;
      `,
    },
    shimmer: css`
      background-image: linear-gradient(
        90deg,
        transparent 0,
        ${transparentize(0.7, colorsTheme.bg1)} 20%,
        ${lighten(0.07, transparentize(0.6, colorsTheme.bg1))} 60%,
        transparent
      );
      animation: shimmer 2s infinite;
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
    colorScrollbar: css`
      // Firefox only
      scrollbar-color: ${transparentize(0.5, colorsTheme.text2)} ${colorsTheme.grey1};
      scroll-behavior: smooth;

      // Webkit browsers only
      &::-webkit-scrollbar {
        background: ${transparentize(0.6, colorsTheme.grey1)};
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: ${transparentize(0.7, colorsTheme.text2)};
        border: 3px solid ${transparentize(0.7, colorsTheme.text2)};
        border-radius: 14px;
        background-clip: padding-box;
      }
    `,
    textShadow1: `
      ${
        darkMode
          ? `0px 0px 26px ${transparentize(0.9, colorsTheme.text1)}, 0px 0px 28px ${transparentize(
              0.8,
              colorsTheme.text1
            )}`
          : 'none'
      }
    `,
    boxShadow1: darkMode ? '0 24px 32px rgba(0, 0, 0, 0.06)' : '0 12px 12px rgba(5, 43, 101, 0.06)',
    boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
    boxShadow3: `0 4px 12px 0 ${transparentize(0.9, colorsTheme.text3)}`,
    gradient1: `linear-gradient(145deg, ${colorsTheme.bg1}, ${colorsTheme.grey1})`,
    input: {
      bg1: darkMode ? '#07162D' : '#ECF1F8',
    },
    button: {
      bg1: darkMode
        ? 'linear-gradient(90deg, #0852C5 0%, #1970F8 100%), linear-gradient(0deg, #0852C5, #0852C5), #0F5BD0;'
        : '#052B65',
      text1: darkMode ? colorsTheme.text1 : '#FFFFFF',
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
      maxWidth: {
        swap: '470px',
        limit: '1350px',
        content: '680px',
      },
    },
    transaction: {
      tokenBackground: colorsTheme.bg2,
      tokenColor: '#1d4373',
      tokenBorder: darkMode ? '#01182a' : colorsTheme.bg3,
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
    dancingCow: css`
      background: url(${Cursor1}), no-repeat;
      animation: dancingCow 1s infinite;
      @keyframes dancingCow {
        0% {
          background: url(${Cursor1}), no-repeat;
        }
        25% {
          background: url(${Cursor2}), no-repeat;
        }
        50% {
          background: url(${Cursor3}), no-repeat;
        }
        75% {
          background: url(${Cursor4}), no-repeat;
        }
      }
    `,
    card: {
      background: css`
        background: linear-gradient(145deg, ${colorsTheme.bg3}, ${colorsTheme.bg1});
      `,
      background2: darkMode ? '#01182a' : colorsTheme.bg3,
      background3: css`
        background: ${darkMode ? '#0f2644' : '#ffffff'};
      `,
      border: `${darkMode ? 'rgb(197 218 239 / 10%)' : 'rgb(16 42 72 / 20%)'}`,
      boxShadow: css`
        background: linear-gradient(145deg, ${colorsTheme.bg1}, ${colorsTheme.grey1});
        box-shadow: inset 0 1px 1px 0 hsl(0deg 0% 100% / 10%), 0 10px 40px -20px #000000;
      `,
    },
    iconGradientBorder: css`
      background: conic-gradient(${colorsTheme.bg3} 40grad, 80grad, ${colorsTheme.bg2} 360grad);
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
      border: `0`,
      boxShadow: `0px 4px 8px rgba(0, 0, 0, 0.06);`,
      color: colorsTheme.text1,
      colorSelected: colorsTheme.text1,
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
      color: colorsTheme.text1,
      background: darkMode ? colorsTheme.bg3 : colorsTheme.bg1,
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
    scrollbar-color: ${({ theme }) => theme.colorScrollbar};
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

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.white};
  }

  // TODO: Can be removed once we control this component
  [data-reach-dialog-overlay] {
    z-index: 10!important;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      top: 0!important;
      bottom: 0!important;
    `}
  }

  // Appzi Container override
  div[id*='appzi-wfo-'] {
    display: none!important; // Force hiding Appzi container when not opened
  }

  body[class*='appzi-f-w-open-'] div[id^='appzi-wfo-'] {
    z-index: 2147483004!important;
    display: block!important;
  }

  a {
    text-decoration: none;

    :hover {
      text-decoration: underline;
    }
  }

`
