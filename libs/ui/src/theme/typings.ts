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
  redShade: ColorValue
  textLink: ColorValue
  greenShade: ColorValue
  blueShade: ColorValue
  blueShade2: ColorValue
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
  scrollbarBg: ColorValue
  scrollbarThumb: ColorValue
  tableHeadBG: ColorValue
  tableRowBG: ColorValue
  info: ColorValue
  information: ColorValue
  warning: ColorValue
  alert: ColorValue
  alert2: ColorValue
  error: ColorValue
  infoText: ColorValue
  warningText: ColorValue
  errorText: ColorValue
  cardBackground: ColorValue
  cardBorder: ColorValue
  cardShadow1: ColorValue
  cardShadow2: ColorValue
  blueDark1: ColorValue
  blueDark2: ColorValue
  blueLight1: ColorValue
  grey1: ColorValue
  red1: ColorValue
  paperCustom: ColorValue
  paperDarkerCustom: ColorValue
  paperDarkestCustom: ColorValue
  paperLighterCustom: ColorValue
  buttonTextCustom: ColorValue
}

declare module 'styled-components' {
  // Override theme
  export interface CowProtocolTheme extends Colors {
    mode: CowSwapTheme
    isInjectedWidgetMode: boolean
    shimmer: FlattenSimpleInterpolation
    colorScrollbar: FlattenSimpleInterpolation
    textShadow1: string
    boxShadow1: string
    boxShadow2: string
    boxShadow3: string
    gradient1: string
    gradient2: string
    input: {
      bg1: ColorValue
    }
    button: {
      bg1: ColorValue
      text1: ColorValue
    }
    util: {
      invertImageForDarkMode: string | null
    }
    cursor?: FlattenSimpleInterpolation
    body: {
      background?: FlattenSimpleInterpolation
    }
    appBody: {
      maxWidth: {
        swap: string
        limit: string
        content: string
      }
    }
    transaction: {
      tokenBackground: string
      tokenColor: string
      tokenBorder: string
    }
    neumorphism: {
      boxShadow: FlattenSimpleInterpolation
    }
    cowToken: {
      background: FlattenSimpleInterpolation
      boxShadow: FlattenSimpleInterpolation
    }
    iconGradientBorder: FlattenSimpleInterpolation
    card: {
      background: FlattenSimpleInterpolation
      background2: string
      background3: FlattenSimpleInterpolation
      border: string
      boxShadow: FlattenSimpleInterpolation
    }
    header: {
      border: string
      menuFlyout: {
        background?: string
        color?: string
        colorHover?: string
        colorHoverBg?: string
        closeButtonBg?: string
        closeButtonColor?: string
        seperatorColor?: string
      }
    }
    swap: {
      headerSize: string
      arrowDown: {
        background: string
        color: string
        colorHover: string
        borderRadius: string
        width: string
        height: string
        borderColor: string
        borderSize: string
      }
    }
    currencyInput?: {
      background?: string
      border?: string
      color?: string
    }
    buttonCurrencySelect: {
      background: string
      boxShadow?: string
      border?: string
      color?: string
      colorSelected?: string
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
    bgLinearGradient: FlattenSimpleInterpolation
    footerColor: string
    networkCard: {
      background: string
      text: string
    }
    wallet: {
      background?: string
      color?: string
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
    grids: any

    // shadows
    shadow1: string

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation
  }

  export interface DefaultTheme extends CowProtocolTheme {}
}
