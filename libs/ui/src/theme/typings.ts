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
  bg3: ColorValue
  bg5: ColorValue
  grey1: ColorValue
  green1: ColorValue
  yellow3: ColorValue
  blue1: ColorValue
  bg8: ColorValue
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
  blue100Primary: ColorValue
  blue300Primary: ColorValue
  blue400Primary: ColorValue
  blue900Primary: ColorValue
  // TODO: Colors migrated from cow-fi
  // TODO: Remove these once we've migrated all the colors
  cowfi_orange: ColorValue
  cowfi_darkBlue: ColorValue
  cowfi_darkBlue2: ColorValue
  cowfi_darkBlue3: ColorValue
  cowfi_darkBlue4: ColorValue
  cowfi_darkBlue5: ColorValue
  cowfi_lightBlue1: ColorValue
  cowfi_lightBlue2: ColorValue
  cowfi_lightBlue3: ColorValue
  cowfi_lightBlue4: ColorValue
  cowfi_white2: ColorValue
  cowfi_grey: ColorValue
  cowfi_grey2: ColorValue
  cowfi_grey3: ColorValue
  cowfi_text1: ColorValue
  cowfi_text2: ColorValue
  cowfi_border: ColorValue
  cowfi_borderGradient: ColorValue
  cowfi_gradient: ColorValue
  cowfi_gradient2: ColorValue
  cowfi_gradientMesh: StyledFlattenSimpleInterpolation
  cowfi_purple1: ColorValue
  cowfi_purple2: ColorValue
  cowfi_purple3: ColorValue
  cowfi_discord_pink: ColorValue
  cowfi_snapshot_red: ColorValue

  // CoW AMM Colors
  cowamm_green: ColorValue
  cowamm_dark_green: ColorValue
  cowamm_dark_green2: ColorValue
  cowamm_light_green: ColorValue
}

export interface ThemeUtils {
  shimmer: StyledFlattenSimpleInterpolation
  colorScrollbar: StyledFlattenSimpleInterpolation
  invertImageForDarkMode: string | null
  flexColumnNoWrap: StyledFlattenSimpleInterpolation
  flexRowNoWrap: StyledFlattenSimpleInterpolation
}

// Export the theme interface for external use
export interface CowProtocolTheme extends Colors, ThemeUtils {
  mode: CowSwapTheme
}

declare module 'styled-components' {
  export interface DefaultTheme extends CowProtocolTheme {
    // No additional properties needed
  }
}
