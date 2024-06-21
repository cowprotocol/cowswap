import { CowSwapTheme } from '../types'

import type { FlattenSimpleInterpolation as StyledFlattenSimpleInterpolation } from 'styled-components/macro'

type ColorValue = string

// Override colors
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
}

declare module 'styled-components' {
  // Override theme
  export interface CowProtocolTheme extends Colors {
    mode: CowSwapTheme
    shimmer: StyledFlattenSimpleInterpolation
    colorScrollbar: StyledFlattenSimpleInterpolation
    boxShadow1: string
    boxShadow2: string
    gradient1: string
    gradient2: string
    util: {
      invertImageForDarkMode: string | null
    }
    cursor?: StyledFlattenSimpleInterpolation

    shadow1: string

    // css snippets
    flexColumnNoWrap: StyledFlattenSimpleInterpolation
    flexRowNoWrap: StyledFlattenSimpleInterpolation
  }

  export interface DefaultTheme extends CowProtocolTheme {}
}
