import { darken } from 'color2k'
import { transparentize } from 'polished'
import { css } from 'styled-components/macro'

/**
 * Central color system for CoW Protocol applications
 *
 * Colors are organized into several categories:
 * 1. CoW Protocol colors (cowfi_): Brand-specific colors
 * 2. CoW AMM colors (cowamm_): AMM-specific colors
 * 3. Explorer colors (explorer_): Explorer-specific colors
 *
 * Usage:
 * import { Color } from '@cowprotocol/ui'
 * color: ${Color.neutral100}
 */
export const Color = {
  // TODO(theme-cleanup): These colors below were migrated
  // TODO(theme-cleanup): They should be reviewed and potentially consolidated with the existing color system.

  // CoW Protocol Colors
  cowfi_orange: '#ED6834',
  cowfi_orange_light: '#F9A36F',
  cowfi_orange_bright: '#ec4612',
  cowfi_orange_pale: '#fee7cf',
  cowfi_peach: '#FDC99F',
  cowfi_yellow: '#F2CD16',
  cowfi_purple1: '#8702AA',
  cowfi_purple2: '#FCCAF2',
  cowfi_purple3: '#66018E',
  cowfi_purple4: '#ED60E9',
  cowfi_purple_bright: '#f996ee',
  cowfi_purple_dark: '#490072',
  cowfi_discord_pink: '#FDADA3',
  cowfi_snapshot_red: '#710408',
  cowfi_green: '#2b6f0b',
  cowfi_darkBlue: '#052B65',
  cowfi_darkBlue2: '#0D3673',
  cowfi_darkBlue3: '#042a63',
  cowfi_darkBlue4: '#042456',
  cowfi_darkBlue5: '#005EB7',
  cowfi_lightBlue2: 'rgb(176 194 255)',
  cowfi_lightBlue3: 'rgb(118 167 230)',
  cowfi_lightBlue4: '#99ECFF',
  cowfi_grey: 'rgb(236, 241, 248)',
  cowfi_grey2: 'rgb(201 211 226)',
  cowfi_grey3: '#737b96',
  cowfi_text1: '#405A82',
  cowfi_text2: '#95BAEF',

  // CoW AMM Colors
  cowamm_green: '#BCEC79',
  cowamm_green_light: '#9BD955',
  cowamm_dark_green: '#194D05',
  cowamm_dark_green2: '#224D22',
  cowamm_light_green: '#DCF8A7',

  // Explorer Colors
  explorer_red1: '#FF305B',
  explorer_red4: '#d83265',
  explorer_green1: '#00C46E',
  explorer_green2: '#09371d',
  explorer_green3: '#a9ffcd',
  explorer_yellow4: '#f6c343',
  explorer_blue1: '#2172E5',
  explorer_orange1: '#D96D49',
  explorer_bg: '#16171F',
  explorer_bg2: '#2C2D3F',
  explorer_background: '#232432',
  explorer_bgWrapper: '#181a1b',
  explorer_bgActionCards: '#0269025c',
  explorer_bgHighlighted: '#3f4104',
  explorer_bgSelected: '#d9d9d9',
  explorer_bgSelectedDarker: '#b6b6b6',
  explorer_bgSelectedDark: '#2a2d2f',
  explorer_bgProgress: '#4338b5',
  explorer_bgInput: '#2a2d2f',
  explorer_bgInputLighter: '#404040',
  explorer_bgRowHover: '#09233e',
  explorer_bgButtonHover: '#0B66C6',
  explorer_bgButtonDisabled: '#2772c3',
  explorer_bgBanner: '#252729',
  explorer_bgDeleteOrders: '#621b1b',
  explorer_bgDisabled: '#ffffff80',
  explorer_bgOpaque: '#ffffff26',
  explorer_bgLighter: '#f7f7f7',
  explorer_paperCustom: '#0e0f14',
  explorer_shade: '#2E2F3B',
  explorer_textSecondary1: '#EDEDED',
  explorer_textSecondary2: '#9797B8',
  explorer_textSecondary: '#545454',
  explorer_textActive: '#D96D49',
  explorer_textButtonHover: '#e9e9f0',
  explorer_textBanner: 'wheat',
  explorer_textDeleteOrders: '#bdb6b5',
  explorer_textError: '#cd3636',
  explorer_textDisabled: '#31323E',
  explorer_networkBackground: '#62688F',
  explorer_networkText: '#545454',
  explorer_border: 'rgb(151 151 184 / 30%)',
  explorer_borderPrimary: 'rgb(151 151 184 / 30%)',
  explorer_tableRowBorder: 'rgb(151 151 184 / 10%)',
  explorer_boxShadow: 'rgba(0, 0, 0, 0.16)',
  explorer_buttonPrimary: '#e8e6e3',
  explorer_buttonSuccess: '#00BE2E',
  explorer_buttonDisabled: '#3d4043',
  explorer_buttonDanger: '#eb4025',
  explorer_buttonSecondary: '#696969',
  explorer_buttonWarning: '#f1851d',
  explorer_labelBgOpen: '#9797B84D',
  explorer_gradient1: '#21222E',
  explorer_gradient2: '#2C2D3F',
  explorer_shadow: '#00000047',
  explorer_grey: '#8D8DA9',
  explorer_greyShade: 'rgb(141 141 169 / 70%)',
  explorer_greyOpacity: 'rgb(141 141 169 / 10%)',
  explorer_greenOpacity: 'rgb(0 216 151 / 10%)',
  explorer_orangeOpacity: 'rgb(217 109 73 / 10%)',

  // Blue Primary Color Palette - Theme colors that can be used directly
  blue100Primary: '#CCF8FF',
  blue200Primary: '#99ECFF',
  blue300Primary: '#65D9FF',
  blue400Primary: '#3FC4FF',
  blue500Primary: '#00A1FF',
  blue700Primary: '#005EB7',
  blue900Primary: '#012F7A',

  // Base Theme Colors - Colors from baseTheme that may need direct access
  blueDark2: '#004293',
  blueDark3: '#0d5ed9',
  blueDark4: '#021E34',
  blueLight1: '#CAE9FF',
  blueLight2: '#afcbda',
  darkerDark: '#090A20',
  darkerLight: '#090A20',
  error: '#D41300',
  blue1: '#3F77FF',
  orange: '#FF784A',
  blueShade: '#0f2644',
  green1Light: '#007D35',
  green1Dark: '#27AE60',
  yellow3: '#F3B71E',
  paperDark: '#18193B',
  backgroundLight: '#ECF1F8',
  alertDark: '#FFCA4A',
  alertLight: '#DB971E',
  successDark: '#00D897',
  successLight: '#007B28',
  textDark: '#DEE3E6',
  textLight: '#00234E',
  disabledTextDark: '#86B2DC',
  disabledTextLight: '#506B93',
  dangerDark: '#f44336',
  errorDark: '#EB3030',
  alert2: '#F8D06B',
  warningDark: '#ED6237',
  warningLight: '#D94719',
  infoDark: '#428dff',
  text4Dark: 'rgba(197, 218, 239, 0.7)',
  text4Light: '#000000b8',
  grey1Dark: '#40587F',
  grey1Light: '#8FA3BF',
  blue2Dark: '#a3beff',
  blue2Light: '#0c40bf',
  bg3Dark: '#1a3c6b',
  bg3Light: '#D0E3EC',
  bg5Dark: '#1d4373',
  bg5Light: '#D5E9F0',
  bg8Light: '#152943',
  blueShade3Dark: '#1c416e',
  blueShade3Light: '#bdd6e1',
  border2Dark: '#254F83',
  disabledDark: 'rgba(197, 218, 239, 0.4)',
  boxShadow1Dark: '0 24px 32px rgba(0, 0, 0, 0.06)',
  boxShadow1Light: '0 12px 12px rgba(5, 43, 101, 0.06)',
  boxShadow2: '0 4px 12px 0 rgb(0 0 0 / 15%)',
  shadow1Dark: '#000',
  shadow1Light: '#2F80ED',

  // Neutral colors - Base grayscale palette
  white: '#FFFFFF',
  neutral100: '#FFFFFF',
  neutral98: '#FFF8F7',
  neutral95: '#FFEDEC',
  neutral90: '#F0DEDE',
  neutral80: '#D4C3C2',
  neutral70: '#B8A7A7',
  neutral60: '#9C8D8D',
  neutral50: '#827474',
  neutral40: '#685B5B',
  neutral30: '#504444',
  neutral20: '#382E2E',
  neutral10: '#23191A',
  neutral0: '#000000',
  black: '#000000',
} as const

// Gradients and special effects
export const Gradients = {
  cowfi_border: transparentize('0.75', '#979797'),
  cowfi_borderGradient: `linear-gradient(to bottom, ${transparentize('0.75', '#979797')}, ${transparentize('1.0', '#979797')})`,
  cowfi_gradient: 'linear-gradient(45deg,#FFE7E0 0%,#F8DBF4 20%,#C4DDFF 60%,#CAE9FF 100%)',
  cowfi_gradient2: 'linear-gradient(0deg, #071B3B 0%, #052B65 100%)',
  cowfi_gradientMesh: css`
    background-color: hsla(142, 0%, 100%, 1);
    background-image:
      radial-gradient(at 5% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 47% 40%, hsla(214, 100%, 88%, 1) 0px, transparent 50%),
      radial-gradient(at 73% 3%, hsla(308, 67%, 91%, 1) 0px, transparent 50%),
      radial-gradient(at 44% 13%, hsla(13, 100%, 93%, 1) 0px, transparent 50%),
      radial-gradient(at 61% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 32% 81%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
      radial-gradient(at 19% 39%, hsla(204, 100%, 89%, 1) 0px, transparent 50%);
  `,
} as const

export const Opacity = {
  full: '1',
  high: '0.9',
  medium: '0.6',
  low: '0.4',
  none: '0',
} as const

/**
 * Generic color mapping system - maps light colors to their dark equivalents
 * This allows us to reuse existing colors without duplication
 */
const COLOR_MAPPINGS = {
  // Blue primary color mappings - reusing existing defined colors
  blue100Primary: { light: 'blue100Primary', dark: 'blueDark4' },
  blue200Primary: { light: 'blue200Primary', dark: 'blueShade3Dark' },
  blue300Primary: { light: 'blue300Primary', dark: 'blueDark3' },
  blue400Primary: { light: 'blue400Primary', dark: 'blue1' },
  blue500Primary: { light: 'blue500Primary', dark: 'blue300Primary' },
  blue700Primary: { light: 'blue700Primary', dark: 'blue700Primary' },
  blue900Primary: { light: 'blue900Primary', dark: 'blueLight1' },

  // Purple primary color mappings
  purple200Primary: { light: 'cowfi_purple_bright', dark: 'cowfi_purple_bright' },
  purple800Primary: { light: 'cowfi_purple_dark', dark: 'cowfi_purple_dark' },
} as const

/**
 * Generic function to apply color mappings based on dark mode
 */
function applyColorMappings<T extends keyof typeof COLOR_MAPPINGS>(
  colorKeys: T[],
  darkMode: boolean,
): Record<T, string> {
  return colorKeys.reduce(
    (acc, key) => {
      const mapping = COLOR_MAPPINGS[key]
      const colorKey = darkMode ? mapping.dark : mapping.light
      acc[key] = Color[colorKey as keyof typeof Color]
      return acc
    },
    {} as Record<T, string>,
  )
}

/**
 * Helper function to get basic theme colors
 */
function getBasicThemeColors(darkMode: boolean): {
  paper: string
  background: string
  alert: string
  success: string
  text: string
  disabledText: string
  danger: string
} {
  return {
    paper: darkMode ? Color.paperDark : Color.white,
    background: darkMode ? Color.black : Color.backgroundLight,
    alert: darkMode ? Color.alertDark : Color.alertLight,
    success: darkMode ? Color.successDark : Color.successLight,
    text: darkMode ? Color.textDark : Color.textLight,
    disabledText: darkMode ? Color.disabledTextDark : Color.disabledTextLight,
    danger: darkMode ? Color.dangerDark : Color.error,
  }
}

/**
 * Helper function to get additional theme colors
 */
function getAdditionalThemeColors(darkMode: boolean): {
  error: string
  warning: string
  info: string
  white: string
  text1: string
  text4: string
  grey1: string
} {
  return {
    error: darkMode ? Color.errorDark : Color.error,
    warning: darkMode ? Color.warningDark : Color.warningLight,
    info: darkMode ? Color.infoDark : Color.blueDark3,
    white: darkMode ? Color.blueLight1 : Color.white,
    text1: darkMode ? Color.blueLight1 : Color.blueDark2,
    text4: darkMode ? Color.text4Dark : Color.text4Light,
    grey1: darkMode ? Color.grey1Dark : Color.grey1Light,
  }
}

/**
 * Helper function to get core theme colors
 */
function getCoreThemeColors(darkMode: boolean): {
  paper: string
  background: string
  alert: string
  success: string
  text: string
  disabledText: string
  danger: string
  error: string
  warning: string
  info: string
  white: string
  text1: string
  text4: string
  grey1: string
} {
  return {
    ...getBasicThemeColors(darkMode),
    ...getAdditionalThemeColors(darkMode),
  }
}

/**
 * Helper function to get background variant colors
 */
function getBackgroundColors(darkMode: boolean): {
  bg2: string
  bg3: string
  bg5: string
  bg8: string
} {
  return {
    bg2: darkMode ? Color.blueDark3 : Color.blueDark2,
    bg3: darkMode ? Color.bg3Dark : Color.bg3Light,
    bg5: darkMode ? Color.bg5Dark : Color.bg5Light,
    bg8: darkMode ? Color.blueDark4 : Color.bg8Light,
  }
}

/**
 * Helper function to get UI colors
 */
function getUIColors(darkMode: boolean): {
  blue2: string
  blueShade3: string
  border: string
  border2: string
  disabled: string
  green1: string
} {
  return {
    blue2: darkMode ? Color.blue2Dark : Color.blue2Light,
    blueShade3: darkMode ? Color.blueShade3Dark : Color.blueShade3Light,
    border: darkMode ? Color.blueDark4 : Color.neutral100,
    border2: darkMode ? Color.border2Dark : Color.blueLight2,
    disabled: darkMode ? Color.disabledDark : Color.blueLight2,
    green1: darkMode ? Color.green1Dark : Color.green1Light,
  }
}

/**
 * Helper function to get effect colors
 */
function getEffectColors(darkMode: boolean): {
  boxShadow1: string
  shadow1: string
} {
  return {
    boxShadow1: darkMode ? Color.boxShadow1Dark : Color.boxShadow1Light,
    shadow1: darkMode ? Color.shadow1Dark : Color.shadow1Light,
  }
}

/**
 * Helper function to get primary colors
 */
function getPrimaryColors(darkMode: boolean): {
  primary: string
  buttonTextCustom: string
} {
  return {
    primary: darkMode ? Color.blue300Primary : Color.blueDark2,
    buttonTextCustom: darkMode ? Color.black : Color.blue300Primary,
  }
}

/**
 * Helper function to get paper variant colors
 */
function getPaperColors(darkMode: boolean): {
  paperCustom: string
  paperDarkerCustom: string
  paperDarkestCustom: string
} {
  return {
    paperCustom: darkMode ? Color.paperDark : Color.white,
    paperDarkerCustom: darkMode ? Color.darkerDark : Color.darkerLight,
    paperDarkestCustom: darkMode ? darken(Color.darkerDark, 0.05) : darken(Color.darkerLight, 0.1),
  }
}

/**
 * Helper function to get gradient colors
 */
function getGradientColors(darkMode: boolean): {
  gradient1: string
  gradient2: string
} {
  return {
    gradient1: `linear-gradient(145deg, ${darkMode ? Color.paperDark : Color.white}, ${darkMode ? Color.black : Color.backgroundLight})`,
    gradient2: `linear-gradient(250deg, ${transparentize(0.92, darkMode ? Color.alertDark : Color.alertLight)} 10%, ${transparentize(
      0.92,
      darkMode ? Color.successDark : Color.successLight,
    )} 50%, ${transparentize(0.92, darkMode ? Color.successDark : Color.successLight)} 100%);`,
  }
}

/**
 * Theme colors return type
 */
export type ThemeColors = {
  // Core theme colors
  paper: string
  background: string
  alert: string
  success: string
  text: string
  disabledText: string
  danger: string
  error: string
  warning: string
  info: string
  white: string
  text1: string
  text4: string
  grey1: string
  // Background variants
  bg2: string
  bg3: string
  bg5: string
  bg8: string
  // UI colors
  blue2: string
  blueShade3: string
  border: string
  border2: string
  disabled: string
  green1: string
  // Effects
  boxShadow1: string
  shadow1: string
  // Primary colors
  primary: string
  buttonTextCustom: string
  // Paper variants
  paperCustom: string
  paperDarkerCustom: string
  paperDarkestCustom: string
  // Blue primary colors
  blue100Primary: string
  blue200Primary: string
  blue300Primary: string
  blue400Primary: string
  blue500Primary: string
  blue900Primary: string
  // Purple primary colors
  purple200Primary: string
  purple800Primary: string
  // Gradients
  gradient1: string
  gradient2: string
}

/**
 * Generates all theme-aware colors for a given dark mode state
 */
export function getThemeColors(darkMode: boolean): ThemeColors {
  return {
    // Core theme colors
    ...getCoreThemeColors(darkMode),

    // Background variants
    ...getBackgroundColors(darkMode),

    // UI colors
    ...getUIColors(darkMode),

    // Effects
    ...getEffectColors(darkMode),

    // Primary colors
    ...getPrimaryColors(darkMode),

    // Paper variants
    ...getPaperColors(darkMode),

    // Blue primary colors - generated systematically using existing color references
    ...applyColorMappings(Object.keys(COLOR_MAPPINGS) as (keyof typeof COLOR_MAPPINGS)[], darkMode),

    // Gradients
    ...getGradientColors(darkMode),
  }
}
