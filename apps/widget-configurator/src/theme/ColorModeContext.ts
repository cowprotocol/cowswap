import { createContext } from 'react'

import { PaletteMode } from '@mui/material'
import { Theme } from '@mui/material/styles'

export interface ColorModeParams {
  mode: PaletteMode
  toggleColorMode(): void
  setAutoMode(): void
  setMode(mode: PaletteMode): void
}

export const ColorModeContext = createContext<ColorModeParams>({
  mode: 'light' as PaletteMode,
  toggleColorMode: () => {},
  setAutoMode: () => {},
  setMode: () => {},
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const globalStyles = (theme: Theme, mode: PaletteMode) => ({
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
    backgroundAttachment: 'fixed',
    backgroundColor: theme.palette.cow.background,
    background: mode === 'light' && theme.palette.cow.gradient,
    backgroundImage: mode === 'dark' && theme.palette.cow.gradient,
  },
  'w3m-modal': {
    zIndex: 1200,
  },
})

export enum ThemeMode {
  Auto = 1,
  Light = 2,
  Dark = 3,
}
