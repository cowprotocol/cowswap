import { CowSwapTheme } from '../types'

import type { FlattenSimpleInterpolation as StyledFlattenSimpleInterpolation } from 'styled-components/macro'

type ColorValue = string

export interface Colors {
  darkMode: boolean
  primary: ColorValue
  background: ColorValue
  paper: ColorValue
  text: ColorValue
  disabledText: ColorValue
  error: ColorValue
  warning: ColorValue
  info: ColorValue
  success: ColorValue
  white: ColorValue
  black: ColorValue
  text1: ColorValue
  text4: ColorValue
  bg2: ColorValue
  bg5: ColorValue
  green1: ColorValue
  yellow3: ColorValue
  blue1: ColorValue
  bg8: ColorValue
  purple: ColorValue
  yellow: ColorValue
  blueShade: ColorValue
  blueShade3: ColorValue
  blue2: ColorValue
  orange: ColorValue
  danger: ColorValue
  border: ColorValue
  border2: ColorValue
  disabled: ColorValue
  alert: ColorValue
  alert2: ColorValue
  blueDark2: ColorValue
  paperCustom: ColorValue
  paperDarkerCustom: ColorValue
  paperDarkestCustom: ColorValue
  buttonTextCustom: ColorValue
  gradient1: ColorValue
  gradient2: ColorValue
  boxShadow1: ColorValue
  boxShadow2: ColorValue
  shadow1: ColorValue
}

export interface ThemeUtils {
  shimmer: StyledFlattenSimpleInterpolation
  colorScrollbar: StyledFlattenSimpleInterpolation
  invertImageForDarkMode: string | null
  flexColumnNoWrap: StyledFlattenSimpleInterpolation
  flexRowNoWrap: StyledFlattenSimpleInterpolation
}

declare module 'styled-components' {
  export interface CowProtocolTheme extends Colors, ThemeUtils {
    mode: CowSwapTheme
  }

  export interface DefaultTheme extends CowProtocolTheme {}
}
