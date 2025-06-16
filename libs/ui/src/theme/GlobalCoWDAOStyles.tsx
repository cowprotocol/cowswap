import { createGlobalStyle, css } from 'styled-components/macro'

import { Color } from '../colors'
import { Font } from '../consts'
import { UI } from '../enum'
import { CoWDAOFonts } from '../fonts'

// eslint-disable-next-line max-lines-per-function,@typescript-eslint/explicit-function-return-type
export const GlobalCoWDAOStyles = () => {
  return createGlobalStyle(
    // eslint-disable-next-line max-lines-per-function
    () => {
      return css`
        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_ULTRALIGHT}) format('woff2');
          font-weight: ${Font.weight.ultralight};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_ULTRALIGHT_ITALIC}) format('woff2');
          font-weight: ${Font.weight.ultralight};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_LIGHT}) format('woff2');
          font-weight: ${Font.weight.light};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_LIGHT_ITALIC}) format('woff2');
          font-weight: ${Font.weight.light};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_REGULAR}) format('woff2');
          font-weight: ${Font.weight.regular};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_REGULAR_ITALIC}) format('woff2');
          font-weight: ${Font.weight.regular};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_BOOK}) format('woff2');
          font-weight: ${Font.weight.book};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_BOOK_ITALIC}) format('woff2');
          font-weight: ${Font.weight.book};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MEDIUM}) format('woff2');
          font-weight: ${Font.weight.medium};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MEDIUM_ITALIC}) format('woff2');
          font-weight: ${Font.weight.medium};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SEMIBOLD}) format('woff2');
          font-weight: ${Font.weight.semibold};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SEMIBOLD_ITALIC}) format('woff2');
          font-weight: ${Font.weight.semibold};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_BOLD}) format('woff2');
          font-weight: ${Font.weight.bold};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixen';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_BOLD_ITALIC}) format('woff2');
          font-weight: ${Font.weight.bold};
          font-style: italic;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenserif';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SERIF_BOLD}) format('woff2');
          font-weight: ${Font.weight.bold};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenserif';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SERIF_MEDIUM}) format('woff2');
          font-weight: ${Font.weight.medium};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenserif';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SERIF_REGULAR}) format('woff2');
          font-weight: ${Font.weight.regular};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenserif';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_SERIF_BOOK}) format('woff2');
          font-weight: ${Font.weight.book};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_REGULAR}) format('woff2');
          font-weight: ${Font.weight.regular};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_BOLD}) format('woff2');
          font-weight: ${Font.weight.bold};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_BOOK}) format('woff2');
          font-weight: ${Font.weight.book};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_SEMIBOLD}) format('woff2');
          font-weight: ${Font.weight.semibold};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_LIGHT}) format('woff2');
          font-weight: ${Font.weight.light};
          font-style: normal;
          font-display: fallback;
        }

        @font-face {
          font-family: 'studiofeixenmono';
          src: url(${CoWDAOFonts.FONT_STUDIO_FEIXEN_MONO_ULTRALIGHT}) format('woff2');
          font-weight: ${Font.weight.ultralight};
          font-style: normal;
          font-display: fallback;
        }

        body {
          font-family: ${Font.family};
          margin: 0;
          padding: 0;
          background: ${Color.neutral98};
          color: ${UI.COLOR_TEXT};
          scroll-behavior: smooth;
          font-variant: none;
          font-variant-ligatures: none;
          text-rendering: optimizeLegibility;
          font-feature-settings:
            'liga' off,
            'kern' on;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        }

        a {
          color: inherit;
        }
      `
    },
  )
}
