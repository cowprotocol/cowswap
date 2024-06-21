import { getContrastText } from '@cowprotocol/ui-utils'

import { transparentize, lighten, darken } from 'color2k'
import { createGlobalStyle, css } from 'styled-components/macro'

import { Colors } from './typings'

import { UI } from '../enum'

export function colors(darkMode: boolean): Colors {
  const buttonTextCustom = '#65D9FF'
  const blueDark2 = '#004293'
  const blueDark3 = '#0d5ed9'
  const blueDark4 = '#021E34'
  const blueLight1 = '#CAE9FF'
  const blueLight2 = '#afcbda'
  const black = '#07162D'
  const white = '#FFFFFF'
  const darkerDark = '#090A20'
  const darkerLight = '#090A20'
  const error = '#D41300'
  const alert = '#FFCA4A'

  return {
    darkMode,
    primary: darkMode ? buttonTextCustom : blueDark2,
    background: darkMode ? black : '#ECF1F8',
    paper: darkMode ? '#0c264b' : white,
    paperCustom: darkMode ? '#18193B' : white,
    paperDarkerCustom: darkMode ? darkerDark : darkerLight,
    paperDarkestCustom: darkMode ? darken(darkerDark, 0.05) : darken(darkerLight, 0.1),
    buttonTextCustom,
    text: darkMode ? '#DEE3E6' : '#00234E',
    disabledText: darkMode ? '#86B2DC' : '#506B93',
    danger: darkMode ? '#f44336' : error,
    alert: darkMode ? alert : '#DB971E',
    warning: darkMode ? '#ED6237' : '#D94719',
    info: darkMode ? '#428dff' : blueDark3,
    success: darkMode ? '#00D897' : '#007B28',
    white: darkMode ? blueLight1 : white,
    black,
    blueDark2,
    bg2: darkMode ? blueDark3 : blueDark2,
    text1: darkMode ? blueLight1 : blueDark2,
    alert2: '#F8D06B',
    error: darkMode ? '#EB3030' : error,
    text4: darkMode ? 'rgba(197, 218, 239, 0.7)' : '#000000b8',

    // ****** backgrounds ******
    bg5: darkMode ? '#1d4373' : '#D5E9F0',
    bg8: darkMode ? blueDark4 : '#152943',

    // ****** other ******
    blue1: '#3F77FF',
    blue2: darkMode ? '#a3beff' : '#0c40bf',
    purple: '#8958FF',
    yellow: '#fff6dc',
    orange: '#FF784A',
    blueShade: '#0f2644',
    blueShade3: darkMode ? '#1c416e' : '#bdd6e1',

    // ****** other ******
    border: darkMode ? blueDark4 : '#000000',
    border2: darkMode ? '#254F83' : blueLight2,

    disabled: darkMode ? 'rgba(197, 218, 239, 0.4)' : blueLight2,

    green1: darkMode ? '#27AE60' : '#007D35',
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
    gradient1: `linear-gradient(145deg, ${colorsTheme.paper}, ${colorsTheme.background})`,
    gradient2: `linear-gradient(250deg, ${transparentize(colorsTheme.alert, 0.92)} 10%, ${transparentize(
      colorsTheme.success,
      0.92
    )} 50%, ${transparentize(colorsTheme.success, 0.92)} 100%);`,
    util: {
      invertImageForDarkMode: darkMode ? 'filter: invert(1) grayscale(1);' : null,
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

    ${UI.COLOR_BUTTON_TEXT}: ${({ theme }) => getContrastText(theme.primary, theme.buttonTextCustom)};

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
    ${UI.COLOR_LIGHT_BLUE_OPACITY_90}: ${({ theme }) => theme.info};
    ${UI.COLOR_LIGHT_BLUE_OPACITY_80}: ${({ theme }) => transparentize(theme.info, 0.2)}; // 80% opacity
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
    ${UI.COLOR_LINK_OPACITY_10}: ${({ theme }) => transparentize(theme.info, 0.9)};

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
    scrollbar-color: ${({ theme }) => theme.colorScrollbar};
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const FixedGlobalStyle = createGlobalStyle`
  ${UniFixedGlobalStyle}
`
