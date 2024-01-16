import { Theme } from 'theme'
import { logDebug } from 'utils'

export type Color = string
export interface Colors {
  // text colours
  textPrimary1: Color
  textSecondary1: Color
  textSecondary2: Color
  textActive1: Color
  textDisabled: Color

  // backgrounds / greys
  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  shade: Color
  boxShadow: Color

  // gradients
  gradient1: Color
  gradient2: Color

  // labels
  labelTextOpen: Color
  labelBgOpen: Color

  // table & borders
  borderPrimary: Color
  tableRowBorder: Color

  // Base
  white: Color
  black: Color
  red1: Color
  red2: Color
  red3?: Color
  red4: Color
  grey: Color
  greyShade: Color
  greyOpacity: Color
  green: Color
  greenOpacity: Color
  green1: Color
  green2: Color
  green3?: Color
  yellow1: Color
  yellow2: Color
  yellow3?: Color
  yellow4: Color
  blue1: Color
  blue2: Color
  blue3?: Color
  blue4: Color
  orange: Color
  orangeOpacity: Color
  orange1: Color
}

export const BASE_COLOURS = {
  // base
  white: '#FFF',
  black: '#000',
  red1: '#FF305B',
  red2: '#FF6871',
  red3: '#F82D3A',
  red4: '#d83265',
  green1: '#00C46E',
  green2: '#09371d',
  green3: '#a9ffcd',
  yellow1: '#f1851d',
  yellow2: '#f1851d',
  yellow4: '#f6c343',
  blue1: '#2172E5',
  blue2: '#3F77FF',
  blue4: '#62688F',
  orange1: '#D96D49',
}

export const LIGHT_COLOURS = {
  //base
  grey: '#657795',
  greyShade: 'rgb(141 141 169 / 70%)',
  greyOpacity: 'rgb(141 141 169 / 10%)',
  green: '#1E9B75',
  greenOpacity: 'rgb(30 155 117 / 10%)',
  orange: '#DB843A',
  orangeOpacity: 'rgb(219 132 58 / 20%)',

  // text
  textPrimary1: '#2B3658',
  textSecondary1: '#EDEDED',
  textSecondary2: '#9797B8',
  textActive1: '#D96D49',
  textDisabled: '#31323E',

  // backgrounds / greys
  bg1: '#F7F8FA',
  bg2: '#F7F8FA',
  bg3: '#232432',
  bg4: '#0e0f14',
  shade: '#2E2F3B',
  boxShadow: 'rgba(0, 0, 0, 0.16)',

  // gradients
  gradient1: '#8958FF',
  gradient2: '#3F77FF',

  // labels
  labelTextOpen: '#77838F',
  labelBgOpen: '#77838F1A',

  // table & borders
  borderPrimary: 'rgb(151 151 184 / 30%)',
  tableRowBorder: 'rgb(151 151 184 / 10%)',
}

export const DARK_COLOURS = {
  // base
  grey: '#8D8DA9',
  greyShade: 'rgb(141 141 169 / 70%)',
  greyOpacity: 'rgb(141 141 169 / 10%)',
  green: '#00D897',
  greenOpacity: 'rgb(0 216 151 / 10%)',
  orange: '#D96D49',
  orangeOpacity: 'rgb(217 109 73 / 10%)',

  // text
  textPrimary1: '#FFF',
  textSecondary1: '#EDEDED',
  textSecondary2: '#9797B8',
  textActive1: '#D96D49',
  textDisabled: '#31323E',

  // backgrounds / greys
  bg1: '#16171F',
  bg2: '#2C2D3F',
  bg3: '#232432',
  bg4: '#0e0f14',
  bgDisabled: '#ffffff80',
  shade: '#2E2F3B',
  boxShadow: 'rgba(0, 0, 0, 0.16)',

  // gradients
  gradient1: '#21222E',
  gradient2: '#2C2D3F',

  // labels
  labelTextOpen: '#FFFFFF',
  labelBgOpen: '#9797B84D',

  // table & borders
  borderPrimary: 'rgb(151 151 184 / 30%)',
  tableRowBorder: 'rgb(151 151 184 / 10%)',

  // TODO: add to theme, not colour palette
  // gradientForm1: 'linear-gradient(270deg, #8958FF 0%, #3F77FF 100%)',
  // gradientForm2: 'linear-gradient(270deg, #8958FF 30%, #3F77FF 100%)',
}

// UTILS
export function getThemePalette(mode: Theme): Colors {
  logDebug(`[THEME] Loading ${mode} theme colour palette`)
  let THEME_COLOURS = LIGHT_COLOURS

  switch (mode) {
    case Theme.LIGHT:
      THEME_COLOURS = LIGHT_COLOURS
      break
    case Theme.DARK:
      THEME_COLOURS = DARK_COLOURS
      break
    default:
      THEME_COLOURS = DARK_COLOURS
  }
  return {
    ...BASE_COLOURS,
    ...THEME_COLOURS,
  }
}
