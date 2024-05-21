import { CowSwapTheme } from '@cowprotocol/widget-lib'
import { createGlobalStyle, css, DefaultTheme } from 'styled-components'

// Fonts
import FONT_STUDIO_FEIXEN_REGULAR from '@cowprotocol/assets/fonts/StudioFeixenSans-Regular.woff2'
import FONT_STUDIO_FEIXEN_REGULAR_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-RegularItalic.woff2'
import FONT_STUDIO_FEIXEN_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Bold.woff2'
import FONT_STUDIO_FEIXEN_BOLD_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-BoldItalic.woff2'
import FONT_STUDIO_FEIXEN_BOOK from '@cowprotocol/assets/fonts/StudioFeixenSans-Book.woff2'
import FONT_STUDIO_FEIXEN_BOOK_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-BookItalic.woff2'
import FONT_STUDIO_FEIXEN_LIGHT from '@cowprotocol/assets/fonts/StudioFeixenSans-Light.woff2'
import FONT_STUDIO_FEIXEN_LIGHT_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-LightItalic.woff2'
import FONT_STUDIO_FEIXEN_MEDIUM from '@cowprotocol/assets/fonts/StudioFeixenSans-Medium.woff2'
import FONT_STUDIO_FEIXEN_MEDIUM_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-MediumItalic.woff2'
import FONT_STUDIO_FEIXEN_SEMIBOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Semibold.woff2'
import FONT_STUDIO_FEIXEN_SEMIBOLD_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-SemiboldItalic.woff2'
import FONT_STUDIO_FEIXEN_ULTRALIGHT from '@cowprotocol/assets/fonts/StudioFeixenSans-Ultralight.woff2'
import FONT_STUDIO_FEIXEN_ULTRALIGHT_ITALIC from '@cowprotocol/assets/fonts/StudioFeixenSans-UltralightItalic.woff2'

export const AMOUNTS_FORMATTING_FEATURE_FLAG = 'highlight-amounts-formatting'
export const SAFE_COW_APP_LINK = 'https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fswap.cow.fi&chain=eth'
export const LINK_GUIDE_ADD_CUSTOM_TOKEN = 'https://blog.cow.fi/how-to-add-custom-tokens-on-cow-swap-a72d677c78c0'
export const MY_ORDERS_ID = 'my-orders'

export const themeMapper = (theme: CowSwapTheme): DefaultTheme => ({
  mode: theme,
})

export const MEDIA_WIDTHS = {
  upToTiny: 320,
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
  upToLargeAlt: 1390,
  upToExtraLarge: 2560,
}

export const Media = {
  upToTiny: `@media (max-width: ${MEDIA_WIDTHS.upToTiny}px)`,
  upToExtraSmall: `@media (max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`,
  upToSmall: `@media (max-width: ${MEDIA_WIDTHS.upToSmall}px)`,
  MediumAndUp: `@media (min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`,
  isMediumOnly: `@media (min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`,
  upToMedium: `@media (max-width: ${MEDIA_WIDTHS.upToMedium}px)`,
  isLargeOnly: `@media (min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`,
  upToLarge: `@media (max-width: ${MEDIA_WIDTHS.upToLarge}px)`,
  LargeAndUp: `@media (min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`,
}

export const Font = {
  family: 'studiofeixen, sans-serif',
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

export const GlobalCoWDAOStyles = createGlobalStyle(
  ({ theme = 'dark' }: { theme: CowSwapTheme }) => css`
    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_ULTRALIGHT}) format('woff2');
      font-weight: ${Font.weight.ultralight};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_ULTRALIGHT_ITALIC}) format('woff2');
      font-weight: ${Font.weight.ultralight};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_LIGHT}) format('woff2');
      font-weight: ${Font.weight.light};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_LIGHT_ITALIC}) format('woff2');
      font-weight: ${Font.weight.light};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_REGULAR}) format('woff2');
      font-weight: ${Font.weight.regular};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_REGULAR_ITALIC}) format('woff2');
      font-weight: ${Font.weight.regular};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_BOOK}) format('woff2');
      font-weight: ${Font.weight.book};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_BOOK_ITALIC}) format('woff2');
      font-weight: ${Font.weight.book};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_MEDIUM}) format('woff2');
      font-weight: ${Font.weight.medium};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_MEDIUM_ITALIC}) format('woff2');
      font-weight: ${Font.weight.medium};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_SEMIBOLD}) format('woff2');
      font-weight: ${Font.weight.semibold};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_SEMIBOLD_ITALIC}) format('woff2');
      font-weight: ${Font.weight.semibold};
      font-style: italic;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_BOLD}) format('woff2');
      font-weight: ${Font.weight.bold};
      font-style: normal;
    }

    @font-face {
      font-family: 'studiofeixen';
      src: url(${FONT_STUDIO_FEIXEN_BOLD_ITALIC}) format('woff2');
      font-weight: ${Font.weight.bold};
      font-style: italic;
    }

    body {
      font-family: ${Font.family};
      margin: 0;
      padding: 0;
      background-color: ${Color.neutral90};
      color: ${Color.neutral100};
    }
  `
)
