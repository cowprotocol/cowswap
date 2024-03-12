import Cursor1 from '@cowprotocol/assets/cow-swap/cursor1.gif'
import Cursor2 from '@cowprotocol/assets/cow-swap/cursor2.gif'
import Cursor3 from '@cowprotocol/assets/cow-swap/cursor3.gif'
import Cursor4 from '@cowprotocol/assets/cow-swap/cursor4.gif'
import { UI, ButtonSize } from '@cowprotocol/ui'
import { getContrastText } from '@cowprotocol/ui-utils'

import { transparentize, lighten, darken } from 'color2k'
import { createGlobalStyle, css } from 'styled-components/macro'

import { colorsUniswap } from 'legacy/theme/colorsUniswap'
import { Colors } from 'legacy/theme/styled'

// TODO: This shouldn't be in the base theme
// Modal override items
// import { HeaderText } from 'legacy/components/WalletModal/Option'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsUniswap(darkMode),

    // V3 colors ======================
    primary: darkMode ? '#0d5ed9' : '#052B65',
    background: darkMode ? '#07162D' : '#ECF1F8',
    paper: darkMode ? '#0c264b' : '#FFFFFF',

    // swap.cow.fi specific overrides ======================
    paperCustom: darkMode ? '#0c264b' : '#FFFFFF',
    paperDarkerCustom: darkMode ? '#07162d' : '#ecf1f8',
    paperDarkestCustom: darkMode ? darken('#07162d', 0.05) : darken('#ecf1f8', 0.1),
    // =====================================================

    text: darkMode ? '#CAE9FF' : '#052B65',
    secondaryText: darkMode ? '#86B2DC' : '#506B93',
    disabledText: darkMode ? '#86B2DC' : '#506B93',

    danger: darkMode ? '#f44336' : '#D41300',
    alert: darkMode ? '#FFCA4A' : '#DB971E',
    warning: darkMode ? '#ED6237' : '#D94719',
    info: darkMode ? '#428dff' : '#0d5ed9',
    success: darkMode ? '#00D897' : '#007B28',

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

    alert2: '#F8D06B',
    error: darkMode ? '#EB3030' : '#D41300',
    information: darkMode ? '#428dff' : '#0d5ed9',

    pending: '#43758C', // deprecate
    attention: '#ff5722', // deprecate

    // DEPRECATED but keeping because of dependencies
    bg3: darkMode ? '#07162D' : '#ECF1F8',
    primary1: darkMode ? '#0d5ed9' : '#052B65',
    primary3: darkMode ? '#0d5ed9' : '#052B65',
    primary4: darkMode ? '#0d5ed9' : '#052B65',
    primary5: darkMode ? '#0d5ed9' : '#052B65',
    red1: darkMode ? '#EB3030' : '#D41300',

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
        var(${UI.COLOR_PAPER}) 20%,
        var(${UI.COLOR_PAPER_DARKER}) 60%,
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
      scrollbar-color: var(${UI.COLOR_PAPER_DARKEST}), var(${UI.COLOR_PAPER_DARKER});
      scroll-behavior: smooth;

      // Webkit browsers only
      &::-webkit-scrollbar {
        background: var(${UI.COLOR_PAPER_DARKER});
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(${UI.COLOR_PAPER_DARKEST});
        border: 3px solid var(${UI.COLOR_PAPER_DARKEST});
        border-radius: 14px;
        background-clip: padding-box;
      }
    `,
    textShadow1: `
      ${
        darkMode
          ? `0px 0px 26px ${`var(${UI.COLOR_TEXT_OPACITY_10})`}, 0px 0px 28px ${`var(${UI.COLOR_TEXT_OPACITY_25})`}`
          : 'none'
      }
    `,
    boxShadow1: darkMode ? '0 24px 32px rgba(0, 0, 0, 0.06)' : '0 12px 12px rgba(5, 43, 101, 0.06)',
    boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
    boxShadow3: `0 4px 12px 0 ${transparentize(colorsTheme.text3, 0.9)}`,
    gradient1: `linear-gradient(145deg, ${colorsTheme.bg1}, ${colorsTheme.grey1})`,
    gradient2: `linear-gradient(250deg, ${transparentize(colorsTheme.alert, 0.92)} 10%, ${transparentize(
      colorsTheme.success,
      0.92
    )} 50%, ${transparentize(colorsTheme.success, 0.92)} 100%);`,
    input: {
      bg1: darkMode ? '#07162D' : '#ECF1F8',
    },
    button: {
      bg1: darkMode
        ? 'linear-gradient(90deg, #0852C5 0%, #1970F8 100%), linear-gradient(0deg, #0852C5, #0852C5), #0F5BD0;'
        : '#052B65',
      text1: darkMode ? `var(${UI.COLOR_TEXT})` : '#FFFFFF',
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
        background: linear-gradient(145deg, var(${UI.COLOR_PAPER}), var(${UI.COLOR_PAPER_DARKER}));
        box-shadow: inset 0 1px 1px 0 hsl(0deg 0% 100% / 10%), 0 10px 40px -20px #000000;
      `,
    },
    iconGradientBorder: css`
      background: conic-gradient(var(${UI.COLOR_PAPER}) 40grad, 80grad, var(${UI.COLOR_PRIMARY}) 360grad);
    `,
    header: {
      border: 'none',
      menuFlyout: {
        background: 'transparent',
        color: darkMode ? `var(${UI.COLOR_TEXT})` : colorsTheme.text2,
        colorHover: darkMode ? `var(${UI.COLOR_TEXT})` : colorsTheme.text2,
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
        color: inherit;
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
      color: `var(${UI.COLOR_TEXT})`,
      border: `2px solid ${darkMode ? colorsTheme.blueShade2 : colorsTheme.disabled}`,
    },
    buttonCurrencySelect: {
      background: colorsTheme.bg1,
      border: `0`,
      boxShadow: `0px 4px 8px rgba(0, 0, 0, 0.06);`,
      color: `var(${UI.COLOR_TEXT})`,
      colorSelected: `var(${UI.COLOR_TEXT})`,
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    footerColor: darkMode ? `var(${UI.COLOR_TEXT})` : colorsTheme.greenShade,
    networkCard: {
      background: 'rgb(255 120 74 / 60%)',
      text: colorsTheme.black,
    },
    wallet: {
      color: `var(${UI.COLOR_TEXT})`,
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
  :root {
    // V3
    ${UI.COLOR_PRIMARY}: ${({ theme }) => theme.primary};
    ${UI.COLOR_PRIMARY_LIGHTER}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.primary, 0.1) : lighten(theme.primary, 0.2)};
    ${UI.COLOR_PRIMARY_DARKER}: ${({ theme }) =>
      theme.darkMode ? darken(theme.primary, 0.2) : darken(theme.primary, 0.1)};
    ${UI.COLOR_PRIMARY_DARKEST}: ${({ theme }) =>
      theme.darkMode ? darken(theme.primary, 0.4) : darken(theme.primary, 0.1)};
    ${UI.COLOR_PRIMARY_PAPER}: ${({ theme }) => getContrastText(theme.paper, theme.primary)};
    ${UI.COLOR_PRIMARY_OPACITY_80}: ${({ theme }) => transparentize(theme.primary, 0.2)};
    ${UI.COLOR_PRIMARY_OPACITY_70}: ${({ theme }) => transparentize(theme.primary, 0.5)};
    ${UI.COLOR_PRIMARY_OPACITY_50}: ${({ theme }) => transparentize(theme.primary, 0.5)};
    ${UI.COLOR_PRIMARY_OPACITY_25}: ${({ theme }) => transparentize(theme.primary, 0.75)};
    ${UI.COLOR_PRIMARY_OPACITY_10}: ${({ theme }) => transparentize(theme.primary, 0.9)};

    ${UI.COLOR_SECONDARY}: ${({ theme }) => theme.primary};

    ${UI.COLOR_BACKGROUND}: ${({ theme }) => theme.background};

    ${UI.COLOR_PAPER}: ${({ theme }) => theme.paper};
    ${UI.COLOR_PAPER_OPACITY_99}: ${({ theme }) => transparentize(theme.paper, 0.99)};
    ${UI.COLOR_PAPER_DARKER}: ${({ theme }) =>
      theme.darkMode ? darken(theme.paper, 0.07) : darken(theme.paper, 0.05)};
    ${UI.COLOR_PAPER_DARKEST}: ${({ theme }) =>
      theme.darkMode ? darken(theme.paper, 0.1) : darken(theme.paper, 0.15)};

    ${UI.COLOR_PAPER}: ${({ theme }) => (theme.isInjectedWidgetMode ? theme.paper : theme.paperCustom)};
    ${UI.COLOR_PAPER_DARKER}: ${({ theme }) => {
      if (theme.isInjectedWidgetMode) {
        return darken(theme.paper, theme.darkMode ? 0.07 : 0.05)
      } else {
        return theme.paperDarkerCustom
      }
    }};

    ${UI.COLOR_PAPER_DARKEST}: ${({ theme }) => {
      if (theme.isInjectedWidgetMode) {
        return darken(theme.paper, theme.darkMode ? 0.1 : 0.15)
      } else {
        return theme.paperDarkestCustom
      }
    }};

    ${UI.COLOR_BORDER}: var(${UI.COLOR_PAPER_DARKER});
    ${UI.BOX_SHADOW}: 0 12px 12px ${({ theme }) => transparentize(theme.primary, 0.94)};
    ${UI.BOX_SHADOW_2}: 0px 4px 8px ${({ theme }) => transparentize(theme.primary, 0.94)};

    ${UI.COLOR_TEXT}: ${({ theme }) => theme.text};
    ${UI.COLOR_TEXT_PAPER}: ${({ theme }) => getContrastText(theme.paper, theme.text)};

    ${UI.COLOR_TEXT_OPACITY_70}: ${({ theme }) => transparentize(theme.text, 0.3)};
    ${UI.COLOR_TEXT_OPACITY_50}: ${({ theme }) => transparentize(theme.text, 0.5)};
    ${UI.COLOR_TEXT_OPACITY_25}: ${({ theme }) => transparentize(theme.text, 0.75)};
    ${UI.COLOR_TEXT_OPACITY_10}: ${({ theme }) => transparentize(theme.text, 0.9)};

    ${UI.COLOR_DISABLED_TEXT}: ${({ theme }) => theme.disabledText};

    ${UI.COLOR_SECONDARY_TEXT}: ${({ theme }) =>
      theme.darkMode ? transparentize(theme.text, 0.6) : transparentize(theme.text, 0.5)};

    ${UI.COLOR_DARK_IMAGE_PAPER}: ${({ theme }) => getContrastText('#000000', theme.paper)};
    ${UI.COLOR_DARK_IMAGE_PAPER_TEXT}: ${({ theme }) =>
      getContrastText(getContrastText('#000000', theme.paper), theme.text)};

    ${UI.COLOR_BUTTON_TEXT}: ${({ theme }) => getContrastText(theme.primary, theme.text)};
    ${UI.COLOR_BUTTON_TEXT_DISABLED}: ${({ theme }) =>
      getContrastText(theme.darkMode ? darken(theme.paper, 0.07) : darken(theme.paper, 0.05), theme.text)};

    ${UI.COLOR_SUCCESS}: ${({ theme }) => theme.success};
    ${UI.COLOR_SUCCESS_BG}: ${({ theme }) => transparentize(theme.success, 0.85)};
    ${UI.COLOR_SUCCESS_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.success, 0.04) : darken(theme.success, 0.1)};

    ${UI.COLOR_INFO}: ${({ theme }) => theme.info};
    ${UI.COLOR_INFO_BG}: ${({ theme }) => transparentize(theme.info, 0.85)};
    ${UI.COLOR_INFO_TEXT}: ${({ theme }) => (theme.darkMode ? lighten(theme.info, 0.04) : darken(theme.info, 0.04))};

    ${UI.COLOR_ALERT}: ${({ theme }) => theme.alert};
    ${UI.COLOR_ALERT_BG}: ${({ theme }) => transparentize(theme.alert, 0.85)};
    ${UI.COLOR_ALERT_TEXT}: ${({ theme }) => (theme.darkMode ? lighten(theme.alert, 0.06) : darken(theme.alert, 0.15))};
    ${UI.COLOR_ALERT_TEXT_DARKER}: ${({ theme }) =>
      getContrastText(theme.alert, theme.darkMode ? darken(theme.alert, 0.55) : darken(theme.alert, 0.35))};

    ${UI.COLOR_WARNING}: ${({ theme }) => theme.warning};
    ${UI.COLOR_WARNING_BG}: ${({ theme }) => transparentize(theme.warning, 0.85)};
    ${UI.COLOR_WARNING_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.warning, 0.04) : darken(theme.warning, 0.04)};

    ${UI.COLOR_DANGER}: ${({ theme }) => theme.danger};
    ${UI.COLOR_DANGER_BG}: ${({ theme }) => transparentize(theme.danger, 0.85)};
    ${UI.COLOR_DANGER_TEXT}: ${({ theme }) =>
      theme.darkMode ? lighten(theme.danger, 0.04) : darken(theme.danger, 0.04)};

    // Badges
    ${UI.COLOR_BADGE_YELLOW_BG}: ${({ theme }) => theme.alert2};
    ${UI.COLOR_BADGE_YELLOW_TEXT}: ${({ theme }) => getContrastText(theme.alert2, darken(theme.alert2, 0.6))};

    // Colors
    ${UI.COLOR_WHITE}: ${({ theme }) => theme.white};
    ${UI.COLOR_BLUE}: ${({ theme }) => theme.blueDark2};
    ${UI.COLOR_LIGHT_BLUE}: ${({ theme }) => theme.blueLight1};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_90}: ${({ theme }) => theme.information};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_80}: ${({ theme }) => transparentize(theme.information, 0.2)}; // 80% opacity
    ${UI.COLOR_YELLOW_LIGHT}: ${({ theme }) => theme.alert2};
    ${UI.COLOR_GREEN}: ${({ theme }) => theme.success};
    ${UI.COLOR_RED}: ${({ theme }) => theme.danger};

    // Base
    ${UI.COLOR_CONTAINER_BG_02}: ${UI.COLOR_PAPER};
    ${UI.MODAL_BACKDROP}: var(${UI.COLOR_TEXT});
    ${UI.BORDER_RADIUS_NORMAL}: 24px;
    ${UI.PADDING_NORMAL}: 24px;

    // Icons
    ${UI.ICON_SIZE_LARGE}: 36px;
    ${UI.ICON_SIZE_NORMAL}: 20px;
    ${UI.ICON_SIZE_SMALL}: 16px;
    ${UI.ICON_SIZE_XSMALL}: 14px;
    ${UI.ICON_SIZE_TINY}: 10px;
    ${UI.ICON_COLOR_NORMAL}: ${({ theme }) => theme.text};

    // Text
    ${UI.COLOR_TEXT_OPACITY_25}: ${({ theme }) => transparentize(theme.text, 0.75)};
    ${UI.COLOR_TEXT_OPACITY_10}: ${({ theme }) => transparentize(theme.text, 0.9)};
    ${UI.COLOR_TEXT2}: ${({ theme }) => transparentize(theme.text, 0.3)};
    ${UI.COLOR_LINK}: ${`var(${UI.COLOR_PRIMARY})`};
    ${UI.COLOR_LINK_OPACITY_10}: ${({ theme }) => transparentize(theme.text3, 0.9)};

    // Font Weights & Sizes
    ${UI.FONT_WEIGHT_NORMAL}: 400;
    ${UI.FONT_WEIGHT_MEDIUM}: 500;
    ${UI.FONT_WEIGHT_BOLD}: 600;
    ${UI.FONT_SIZE_SMALLER}: 10px;
    ${UI.FONT_SIZE_SMALL}: 12px;
    ${UI.FONT_SIZE_NORMAL}: 14px;
    ${UI.FONT_SIZE_MEDIUM}: 16px;
    ${UI.FONT_SIZE_LARGE}: 18px;
    ${UI.FONT_SIZE_LARGER}: 20px;
    ${UI.FONT_SIZE_LARGEST}: 24px;

    // Animation
    ${UI.ANIMATION_DURATION}: 0.1s;
    ${UI.ANIMATION_DURATION_SLOW}: 0.2s;
  }

  body {
    min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'auto' : '100vh')};
    scrollbar-color: ${({ theme }) => theme.colorScrollbar};
    color: var(${UI.COLOR_TEXT_PAPER});
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
    background-color: ${({ theme }) =>
      theme.isInjectedWidgetMode ? 'transparent' : `var(${UI.COLOR_CONTAINER_BG_02})`};
    ${({ theme }) => (theme.isInjectedWidgetMode ? 'transparent' : theme.body.background)};
  }

  *, *:after, *:before { box-sizing:border-box; }

  body {

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
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

    // Walletconnect V2 mobile override
  body #wcm-modal.wcm-overlay {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      align-items: flex-start;
    `}

  a {
    text-decoration: none;

    :hover {
      text-decoration: underline;
    }
  }

`
