import { Colors as ColorsUniswap } from '@src/theme/styled'
export { Color, Grids } from '@src/theme/styled'

// Override colors
export interface Colors extends ColorsUniswap {
  purple: Color
  border: Color
  disabled: Color
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
      src: string
      alt: string
      width: string
      height: string
    }
    cursor?: FlattenSimpleInterpolation
    body: {
      background: FlattenSimpleInterpolation
    }
    appBody: {
      boxShadow: string
      borderRadius: string
      border: string
      padding: string
    }
    header?: {
      border?: string
    }
    swap?: {
      headerSize?: string
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
    buttonPrimary: {
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
  }
}
