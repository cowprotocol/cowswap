import { transparentize } from 'polished'
import { css } from 'styled-components/macro'

/**
 * Central color system for CoW Protocol applications
 *
 * Colors are organized into several categories:
 * 1. Neutral colors (neutral0-100): Base grayscale palette
 * 2. CoW Protocol colors (cowfi_): Brand-specific colors
 * 3. CoW AMM colors (cowamm_): AMM-specific colors
 * 4. Explorer colors (explorer_): Explorer-specific colors
 *
 * Usage:
 * import { Color } from '@cowprotocol/ui'
 * color: ${Color.neutral100}
 */
export const Color = {
  // Neutral colors - Base grayscale palette from black (0) to white (100)
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

  // TODO(theme-cleanup): These colors below were migrated
  // TODO(theme-cleanup): They should be reviewed and potentially consolidated with the existing color system.

  // CoW Protocol Colors
  cowfi_orange: '#ED6834',
  cowfi_orange_light: '#F9A36F',
  cowfi_orange_bright: '#ec4612',
  cowfi_orange_pale: '#fee7cf',
  cowfi_peach: '#FDC99F',
  cowfi_blue: '#00A1FF',
  cowfi_blue_bright: '#3FC4FF',
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
  cowfi_lightBlue1: '#CCF8FF',
  cowfi_lightBlue2: 'rgb(176 194 255)',
  cowfi_lightBlue3: 'rgb(118 167 230)',
  cowfi_lightBlue4: '#99ECFF',
  cowfi_white2: '#FFF8F7',
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
  explorer_blue2: '#3F77FF',
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
  explorer_textPrimary: '#FFFFFF',
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
  explorer_labelTextOpen: '#FFFFFF',
  explorer_labelBgOpen: '#9797B84D',
  explorer_gradient1: '#21222E',
  explorer_gradient2: '#2C2D3F',
  explorer_svgWithdraw: '#000000',
  explorer_shadow: '#00000047',
  explorer_grey: '#8D8DA9',
  explorer_greyShade: 'rgb(141 141 169 / 70%)',
  explorer_greyOpacity: 'rgb(141 141 169 / 10%)',
  explorer_greenOpacity: 'rgb(0 216 151 / 10%)',
  explorer_orangeOpacity: 'rgb(217 109 73 / 10%)',
  explorer_green: '#00D897',
} as const

// Gradients and special effects
export const Gradients = {
  cowfi_border: transparentize('0.75', '#979797'),
  cowfi_borderGradient: `linear-gradient(to bottom, ${transparentize('0.75', '#979797')}, ${transparentize('1.0', '#979797')})`,
  cowfi_gradient: 'linear-gradient(45deg,#FFE7E0 0%,#F8DBF4 20%,#C4DDFF 60%,#CAE9FF 100%)',
  cowfi_gradient2: 'linear-gradient(0deg, #071B3B 0%, #052B65 100%)',
  cowfi_gradientMesh: css`
    background-color: hsla(142, 0%, 100%, 1);
    background-image: radial-gradient(at 5% 70%, hsla(204, 100%, 89%, 1) 0px, transparent 50%),
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
