import { ButtonSize } from '../enum'
import { CowSwapTheme } from '../types'

type ColorValue = string

interface ColorsUniswap {
  darkMode: boolean

  // V3 =======================
  primary: ColorValue
  secondary: ColorValue
  background: ColorValue
  paper: ColorValue

  text: ColorValue
  disabledText: ColorValue

  error: ColorValue
  warning: ColorValue
  info: ColorValue
  success: ColorValue
  // ===========================

  // base
  white: ColorValue
  black: ColorValue

  // text
  text1: ColorValue
  text2: ColorValue
  text3: ColorValue
  text4: ColorValue

  // backgrounds / greys
  bg0: ColorValue
  bg1: ColorValue
  bg2: ColorValue
  bg3: ColorValue
  bg4: ColorValue
  bg5: ColorValue

  modalBG: ColorValue
  advancedBG: ColorValue

  primary1: ColorValue
  primary2: ColorValue
  primary3: ColorValue
  primary4: ColorValue
  primary5: ColorValue

  // other
  red1: ColorValue
  green1: ColorValue
  yellow2: ColorValue
  yellow3: ColorValue
  blue1: ColorValue
  blue2: ColorValue
}

// Override colors
export interface Colors extends ColorsUniswap {
  bg8: ColorValue
  purple: ColorValue
  yellow: ColorValue
  blueShade: ColorValue
  blueShade3: ColorValue
  blue2: ColorValue
  orange: ColorValue
  success: ColorValue
  danger: ColorValue
  pending: ColorValue
  attention: ColorValue
  border: ColorValue
  border2: ColorValue
  disabled: ColorValue
  info: ColorValue
  information: ColorValue
  warning: ColorValue
  alert: ColorValue
  alert2: ColorValue
  error: ColorValue
  infoText: ColorValue
  warningText: ColorValue
  errorText: ColorValue
  blueDark1: ColorValue
  blueDark2: ColorValue
  blueLight1: ColorValue
  grey1: ColorValue
  red1: ColorValue
  paperCustom: ColorValue
  paperDarkerCustom: ColorValue
  paperDarkestCustom: ColorValue
  buttonTextCustom: ColorValue
}

declare module 'styled-components' {
  // Override theme
  export interface CowProtocolTheme extends Colors {
    mode: CowSwapTheme
    isInjectedWidgetMode: boolean
    shimmer: FlattenSimpleInterpolation
    colorScrollbar: FlattenSimpleInterpolation
    boxShadow1: string
    boxShadow2: string
    gradient1: string
    gradient2: string
    util: {
      invertImageForDarkMode: string | null
    }
    cursor?: FlattenSimpleInterpolation
    appBody: {
      maxWidth: {
        swap: string
        limit: string
        content: string
      }
    }
    buttonSizes: Record<ButtonSize, FlattenSimpleInterpolation>
    buttonOutlined: {
      background?: FlattenSimpleInterpolation
      fontSize?: string
      fontWeight?: string
      border?: string
      borderRadius?: string
      boxShadow?: string
    }
    buttonLight: {
      background?: FlattenSimpleInterpolation
      backgroundHover?: string
      fontSize?: string
      fontWeight?: string
      border?: string
      borderHover?: string
      borderRadius?: string
      boxShadow?: string
    }
    mediaWidth: {
      upToTiny: ThemedCssFunction<DefaultTheme>
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
      upToLargeAlt: ThemedCssFunction<DefaultTheme>
      upToExtraLarge: ThemedCssFunction<DefaultTheme>
    }

    // shadows
    shadow1: string

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation
  }

  export interface DefaultTheme extends CowProtocolTheme {}
}
