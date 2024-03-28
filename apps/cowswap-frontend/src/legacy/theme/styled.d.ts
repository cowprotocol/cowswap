import { ButtonSize } from '@cowprotocol/ui'

export type Color = string

interface ColorsUniswap {
  darkMode: boolean

  // V3 =======================
  primary: Color
  secondary: Color
  background: Color
  paper: Color

  text: Color
  secondaryText: Color
  disabledText: Color

  error: Color
  warning: Color
  info: Color
  success: Color
  // ===========================

  // base
  white: Color
  black: Color

  // text
  text1: Color
  text2: Color
  text3: Color
  text4: Color
  text5: Color
  text6: Color

  // backgrounds / greys
  bg0: Color
  bg1: Color
  bg2: Color
  bg3: Color
  bg4: Color
  bg5: Color
  bg6: Color
  bg7: Color

  modalBG: Color
  advancedBG: Color

  primary1: Color
  primary2: Color
  primary3: Color
  primary4: Color
  primary5: Color

  // pinks
  secondary1: Color
  secondary2: Color
  secondary3: Color

  // other
  red1: Color
  red2: Color
  red3: Color
  green1: Color
  yellow1: Color
  yellow2: Color
  yellow3: Color
  blue1: Color
  blue2: Color
  blue4: Color
}

// Override colors
export interface Colors extends ColorsUniswap {
  bg8: Color
  purple: Color
  yellow: Color
  redShade: Color
  textLink: Color
  greenShade: Color
  blueShade: Color
  blueShade2: Color
  blueShade3: Color
  blue2: Color
  orange: Color
  success: Color
  danger: Color
  pending: Color
  attention: Color
  border: Color
  border2: Color
  disabled: Color
  scrollbarBg: Color
  scrollbarThumb: Color
  tableHeadBG: Color
  tableRowBG: Color
  info: Color
  information: Color
  warning: Color
  alert: Color
  alert2: Color
  error: Color
  infoText: Color
  warningText: Color
  errorText: Color
  cardBackground: Color
  cardBorder: Color
  cardShadow1: Color
  cardShadow2: Color
  blueDark1: Color
  blueDark2: Color
  blueLight1: Color
  grey1: Color
  red1: Color
  paperCustom: Color
  paperDarkerCustom: Color
  paperDarkestCustom: Color
  paperLighterCustom: Color
}

declare module 'styled-components' {
  // Copy of DefaultTheme in '../../theme/styled'
  export interface DefaultThemeUniswap extends ColorsUniswap {
    grids: Grids

    // shadows
    shadow1: string

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
    }

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation
  }

  // Override theme
  export interface DefaultTheme extends DefaultThemeUniswap, Colors {
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
      bg1: Color
    }
    button: {
      bg1: Color
      text1: Color
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
    dancingCow: FlattenSimpleInterpolation
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
  }
}
