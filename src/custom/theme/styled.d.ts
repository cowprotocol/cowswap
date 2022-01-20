import { Colors as ColorsUniswap } from '@src/theme/styled'
import { ButtonSize } from 'theme'

// Override colors
export interface Colors extends ColorsUniswap {
  purple: Color
  yellow: Color
  redShade: Color
  textLink: Color
  greenShade: Color
  blueShade: Color
  blueShade2: Color
  blueShade3: Color
  success: Color
  danger: Color
  pending: Color
  attention: Color
  border: Color
  border2: Color
  disabled: Color
  shimmer1: Color
  shimmer2: color
  tableHeadBG: Color
  tableRowBG: Color
  info: Color
  warning: Color
  error: Color
  infoText: Color
  warningText: Color
  errorText: Color
  cardBorder: Color
  cardShadow1: Color
  cardShadow2: Color
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
    // css snippets
    logo: {
      src?: string
      srcIcon?: string
      alt?: string
    }
    util: {
      invertImageForDarkMode: string | null
    }
    cursor?: FlattenSimpleInterpolation
    body: {
      background?: FlattenSimpleInterpolation
    }
    appBody: {
      boxShadow: string
      borderRadius: string
      border: string
      padding: string
      maxWidth: {
        normal: string
        content: string
      }
    }
    neumorphism: {
      boxShadow: FlattenSimpleInterpolation
    }
    cowToken: {
      background: FlattenSimpleInterpolation
      boxShadow: FlattenSimpleInterpolation
    },
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
    buttonPrimary: {
      background?: FlattenSimpleInterpolation
      fontSize?: string
      fontWeight?: string
      border?: string
      borderRadius?: string
      boxShadow?: string
    }
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
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      // MOD
      upToVerySmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
    }
  }
}