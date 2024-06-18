import { CowSwapTheme } from '@cowprotocol/widget-lib'

import { createGlobalStyle, css, DefaultTheme, DefaultThemeUniswap } from 'styled-components/macro'

import { colors, themeVariables as baseThemeVariables } from './theme'
import { UI } from './enum'

export const AMOUNTS_FORMATTING_FEATURE_FLAG = 'highlight-amounts-formatting'
export const SAFE_COW_APP_LINK = 'https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth'
export const LINK_GUIDE_ADD_CUSTOM_TOKEN = 'https://blog.cow.fi/how-to-add-custom-tokens-on-cow-swap-a72d677c78c0'
export const MY_ORDERS_ID = 'my-orders'

declare module 'styled-components' {
  export interface DefaultTheme {
    mode: CowSwapTheme
  }
}

export const themeMapper = (theme: CowSwapTheme, isInjectedWidgetMode = false): DefaultTheme => {
  const darkmode = theme === 'dark'
  const colorsTheme = colors(darkmode)
  return {
    ...getTheme(darkmode),
    ...colorsTheme,
    isInjectedWidgetMode,

    // Override Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    mediaWidth: mediaWidthTemplates,

    mode: darkmode ? 'dark' : 'light',
  }
}

interface ExtendedDefaultThemeUniswap extends DefaultThemeUniswap {
  mode: 'light' | 'dark'
}

export function getTheme(darkMode: boolean): ExtendedDefaultThemeUniswap {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,

    mode: darkMode ? 'dark' : 'light',
  }
}

export const MEDIA_WIDTHS = {
  upToTiny: 320,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
  upToLargeAlt: 1390,
  upToExtraLarge: 2560,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const getMediaQuery = (query: string, useMediaPrefix = true) => {
  return useMediaPrefix ? `@media ${query}` : query
}

export const Media = {
  upToTiny: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToTiny}px)`, useMediaPrefix),
  upToExtraSmall: (useMediaPrefix = true) =>
    getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`, useMediaPrefix),
  upToSmall: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToSmall}px)`, useMediaPrefix),
  MediumAndUp: (useMediaPrefix = true) => getMediaQuery(`(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`, useMediaPrefix),
  isMediumOnly: (useMediaPrefix = true) =>
    getMediaQuery(
      `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`,
      useMediaPrefix
    ),
  upToMedium: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`, useMediaPrefix),
  isLargeOnly: (useMediaPrefix = true) =>
    getMediaQuery(
      `(min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`,
      useMediaPrefix
    ),
  upToLarge: (useMediaPrefix = true) => getMediaQuery(`(max-width: ${MEDIA_WIDTHS.upToLarge}px)`, useMediaPrefix),
  LargeAndUp: (useMediaPrefix = true) => getMediaQuery(`(min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`, useMediaPrefix),
}

export const Font = {
  family: `'studiofeixen', Arial, sans-serif`,
  weight: {
    ultralight: 200,
    light: 300,
    regular: 400,
    book: 450,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

export const Color = {
  neutral100: '#FFFFFF',
  neutral98: '#FFF8F7',
  neutral95: '#FFEDEC',
  neutral90: '#F0DEDE',
  neutral80: '#D4C3C2',
  neutral70: '#B8A7A7',
  neutral60: '#9C8D8D',
  neutral50: '#827474',
  neutral40: '#685B5B',
  neutral30: '#504444',
  neutral20: '#382E2E',
  neutral10: '#23191A',
  neutral0: '#000000',
}

type GlobalFontConfig =
  | string
  | {
      fontFamily: string
      fontWeight?: number
      fontStyle?: string
    }

type GlobalCowDAOFonts = {
  FONT_STUDIO_FEIXEN_BOLD: GlobalFontConfig
  FONT_STUDIO_FEIXEN_BOLD_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_BOOK: GlobalFontConfig
  FONT_STUDIO_FEIXEN_BOOK_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_LIGHT: GlobalFontConfig
  FONT_STUDIO_FEIXEN_LIGHT_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_MEDIUM: GlobalFontConfig
  FONT_STUDIO_FEIXEN_MEDIUM_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_REGULAR: GlobalFontConfig
  FONT_STUDIO_FEIXEN_REGULAR_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_SEMIBOLD: GlobalFontConfig
  FONT_STUDIO_FEIXEN_SEMIBOLD_ITALIC: GlobalFontConfig
  FONT_STUDIO_FEIXEN_ULTRALIGHT: GlobalFontConfig
  FONT_STUDIO_FEIXEN_ULTRALIGHT_ITALIC: GlobalFontConfig
}

export const GlobalCoWDAOStyles = (fonts: GlobalCowDAOFonts, bgColor?: string, color?: string) =>
  createGlobalStyle(
    ({ theme }: { theme: CowSwapTheme }) => css`
      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_ULTRALIGHT}) format('woff2');
        font-weight: ${Font.weight.ultralight};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_ULTRALIGHT_ITALIC}) format('woff2');
        font-weight: ${Font.weight.ultralight};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_LIGHT}) format('woff2');
        font-weight: ${Font.weight.light};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_LIGHT_ITALIC}) format('woff2');
        font-weight: ${Font.weight.light};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_REGULAR}) format('woff2');
        font-weight: ${Font.weight.regular};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_REGULAR_ITALIC}) format('woff2');
        font-weight: ${Font.weight.regular};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_BOOK}) format('woff2');
        font-weight: ${Font.weight.book};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_BOOK_ITALIC}) format('woff2');
        font-weight: ${Font.weight.book};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_MEDIUM}) format('woff2');
        font-weight: ${Font.weight.medium};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_MEDIUM_ITALIC}) format('woff2');
        font-weight: ${Font.weight.medium};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_SEMIBOLD}) format('woff2');
        font-weight: ${Font.weight.semibold};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_SEMIBOLD_ITALIC}) format('woff2');
        font-weight: ${Font.weight.semibold};
        font-style: italic;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_BOLD}) format('woff2');
        font-weight: ${Font.weight.bold};
        font-style: normal;
      }

      @font-face {
        font-family: 'studiofeixen';
        src: url(${fonts.FONT_STUDIO_FEIXEN_BOLD_ITALIC}) format('woff2');
        font-weight: ${Font.weight.bold};
        font-style: italic;
      }

      body {
        font-family: ${Font.family};
        margin: 0;
        padding: 0;
        background: ${({ theme }) =>
          theme?.isInjectedWidgetMode ? 'transparent' : bgColor ? bgColor : Color.neutral98};
        color: ${color || UI.COLOR_TEXT};
        scroll-behavior: smooth;
        font-variant: none;
        font-variant-ligatures: none;
        font-display: swap;
        text-rendering: optimizeLegibility;
        font-feature-settings: 'liga' off, 'kern' on;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      }

      a {
        color: inherit;
      }
    `
  )

// export const THEME = (theme: CowSwapTheme) => {
//   return {
//     buttonSizes: {
//       [ButtonSize.BIG]: css`
//         font-size: 26px;
//         min-height: 60px;
//       `,
//       [ButtonSize.DEFAULT]: css`
//         font-size: 16px;
//       `,
//       [ButtonSize.SMALL]: css`
//         font-size: 12px;
//       `,
//     },
//   }
// }
