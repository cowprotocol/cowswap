import { getContrastText } from '@cowprotocol/ui-utils'

import { transparentize, lighten, darken } from 'color2k'
import { createGlobalStyle, css } from 'styled-components/macro'

import { Colors } from './typings'

import { ButtonSize, UI } from '../enum'

export function colors(darkMode: boolean): Colors {
  return {
    darkMode,
    primary: darkMode ? '#65D9FF' : '#004293',
    background: darkMode ? '#07162D' : '#ECF1F8',
    paper: darkMode ? '#0c264b' : '#FFFFFF',

    // swap.cow.fi specific overrides ======================
    paperCustom: darkMode ? '#18193B' : '#FFFFFF',
    paperDarkerCustom: darkMode ? '#090A20' : '#E5EEF7',
    paperDarkestCustom: darkMode ? darken('#090A20', 0.05) : darken('#E5EEF7', 0.1),
    buttonTextCustom: darkMode ? '#65D9FF' : '#65D9FF',
    // =====================================================

    text: darkMode ? '#DEE3E6' : '#00234E',
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
    blueDark2: '#004293',
    blueLight1: '#CAE9FF',
    grey1: darkMode ? '#07162D' : '#ECF1F8',

    bg1: darkMode ? '#0c264b' : '#ffffff',
    bg2: darkMode ? '#0d5ed9' : '#004293',

    text1: darkMode ? '#CAE9FF' : '#004293',
    text2: darkMode ? '#86B2DC' : '#506B93',
    text3: darkMode ? '#428dff' : '#0d5ed9',

    alert2: '#F8D06B',
    error: darkMode ? '#EB3030' : '#D41300',
    information: darkMode ? '#428dff' : '#0d5ed9',

    pending: '#43758C', // deprecate
    attention: '#ff5722', // deprecate

    // DEPRECATED but keeping because of dependencies
    bg3: darkMode ? '#07162D' : '#ECF1F8',
    primary1: darkMode ? '#0d5ed9' : '#004293',
    primary3: darkMode ? '#0d5ed9' : '#004293',
    primary4: darkMode ? '#0d5ed9' : '#004293',
    primary5: darkMode ? '#0d5ed9' : '#004293',
    red1: darkMode ? '#EB3030' : '#D41300',

    // ==========================================

    // ****** text ******
    text4: darkMode ? 'rgba(197, 218, 239, 0.7)' : '#000000b8',

    // ****** backgrounds ******
    bg4: darkMode ? '#021E34' : '#ffffff',
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg8: darkMode ? '#021E34' : '#152943',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#163861' : '#d5e8f0',

    // ****** other ******
    blue1: '#3F77FF',
    blue2: darkMode ? '#a3beff' : '#0c40bf',
    purple: '#8958FF',
    yellow: '#fff6dc',
    orange: '#FF784A',
    blueShade: '#0f2644',
    blueShade3: darkMode ? '#1c416e' : '#bdd6e1',

    // ****** other ******
    border: darkMode ? '#021E34' : '#000000',
    border2: darkMode ? '#254F83' : '#afcbda',

    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : '#afcbda',

    infoText: darkMode ? '#ffca4a' : '#564D00',
    warningText: '#564D00',
    errorText: '#b91515',

    green1: darkMode ? '#27AE60' : '#007D35',
    yellow2: '#FF8F00',
    yellow3: '#F3B71E',
  }
}

export function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
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
    boxShadow1: darkMode ? '0 24px 32px rgba(0, 0, 0, 0.06)' : '0 12px 12px rgba(5, 43, 101, 0.06)',
    boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
    gradient1: `linear-gradient(145deg, ${colorsTheme.bg1}, ${colorsTheme.grey1})`,
    gradient2: `linear-gradient(250deg, ${transparentize(colorsTheme.alert, 0.92)} 10%, ${transparentize(
      colorsTheme.success,
      0.92
    )} 50%, ${transparentize(colorsTheme.success, 0.92)} 100%);`,
    util: {
      invertImageForDarkMode: darkMode ? 'filter: invert(1) grayscale(1);' : null,
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

export const ThemeColorsGlobalStyle = css`
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

    ${UI.COLOR_BUTTON_TEXT}: ${({ theme }) => {
      if (theme.isInjectedWidgetMode) {
        return getContrastText(theme.primary, theme.text)
      } else {
        return getContrastText(theme.primary, theme.buttonTextCustom)
      }
    }};

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
  ${UniFixedGlobalStyle}
`
