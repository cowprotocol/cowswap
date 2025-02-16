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
  paper: Color
  bg2: Color
  background: Color
  paperCustom: Color
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
  red4: Color
  grey: Color
  greyShade: Color
  greyOpacity: Color
  green: Color
  greenOpacity: Color
  green1: Color
  green2: Color
  green3?: Color
  yellow2: Color
  yellow3?: Color
  yellow4: Color
  blue1: Color
  blue2: Color
  blue3?: Color
  orange: Color
  orangeOpacity: Color
  orange1: Color
}

export const BASE_COLOURS = {
  // base
  white: ' #FFF',
  black: ' #000',
  red1: '#FF305B',
  red4: '#d83265',
  green1: '#00C46E',
  green2: '#09371d',
  green3: '#a9ffcd',
  yellow2: '#f1851d',
  yellow4: '#f6c343',
  blue1: '#a721e5',
  blue2: '#c93fff',
  orange1: '#d96d49',
}

export const LIGHT_COLOURS = {
  //base
  grey: 'rgb(115, 101, 149)',
  greyShade: 'rgb(141 141 169 / 70%)',
  greyOpacity: 'rgb(141 141 169 / 10%)',
  green: 'rgb(30, 88, 155)',
  greenOpacity: 'rgb(30 155 117 / 10%)',
  orange: '#db843a',
  orangeOpacity: 'rgb(219 132 58 / 20%)',

  // text
  textPrimary1: '#4b2b58',
  textSecondary1: '#EDEDED',
  textSecondary2: '#938296',
  textActive1: '#D96D49',
  textDisabled: '#3c313e',

  // backgrounds / greys
  paper: '#f9f7fa',
  bg2: '#f9f7fa',
  background: '#302332',
  paperCustom: '#130e14',
  shade: '#382e3b',
  boxShadow: '#000000',

  // gradients
  gradient1: 'rgb(166, 88, 255)',
  gradient2: 'rgb(223, 63, 255)',

  // labels
  labelTextOpen: 'rgb(128, 119, 143)',
  labelBgOpen: 'rgba(128, 119, 143, 0.1)',

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
  textPrimary1: ' #FFF',
  textSecondary1: '#EDEDED',
  textSecondary2: '#9797B8',
  textActive1: '#D96D49',
  textDisabled: '#31323E',

  // backgrounds / greys
  paper: '#1e161f',
  bg2: '#3c2c3f',
  background: '#2d2332',
  paperCustom: '#120e14',
  bgDisabled: '#ffffff80',
  shade: '#382e3b',
  boxShadow: '#000000',

  // gradients
  gradient1: '#2b212e',
  gradient2: '#3d2c3f',

  // labels
  labelTextOpen: '#FFFFFF',
  labelBgOpen: '#af97b8',

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
