import FONT_STUDIO_FEIXEN_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Bold.woff2'

import type { CSSObject, Theme } from '@mui/material/styles'

export const globalStyles = (theme: Theme): CSSObject => ({
  '@font-face': {
    fontFamily: 'studiofeixen',
    src: `url(${FONT_STUDIO_FEIXEN_BOLD}) format('woff2')`,
    fontStyle: 'normal',
    fontWeight: 700,
    fontDisplay: 'swap',
  },
  'html, input, textarea, button': {
    fontFamily: "'Inter', sans-serif",
    fontDisplay: 'fallback',
  },
  '@supports (font-variation-settings: normal)': {
    'html, input, textarea, button': {
      fontFamily: "'Inter var', sans-serif",
    },
  },
  'html, body, a, button': {
    margin: 0,
    padding: 0,
  },
  'html, body': {
    height: '100%',
    width: '100%',
  },
  body: {
    background: 'none',
  },
  html: {
    width: '100%',
    margin: 0,
    fontSize: '62.5%',
    textRendering: 'geometricPrecision',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    boxSizing: 'border-box',
    overscrollBehaviorY: 'none',
    scrollBehavior: 'smooth',
    fontVariant: 'none',
    fontFeatureSettings: "'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on",
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    backgroundColor: theme.palette.background.paper,
  },
  'w3m-modal': {
    zIndex: 1200,
  },
})
