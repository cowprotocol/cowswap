import { Color, CowLoadingIconPalette } from '@cowprotocol/ui'

import { PaletteMode } from '@mui/material'
import { PaletteOptions } from '@mui/material/styles'

export const BRAND_COLOR: Record<PaletteMode, string> = {
  dark: Color.blue300Primary,
  light: Color.blueDark2,
}

export const LOGO_LOADER_PALETTE: Record<PaletteMode, CowLoadingIconPalette> = {
  dark: {
    background: 'transparent',
    head: BRAND_COLOR.dark,
    eyes: 'rgb(22, 23, 31)',
  },
  light: {
    background: 'transparent',
    head: BRAND_COLOR.light,
    eyes: 'white',
  },
}

export const darkPalette: PaletteOptions = {
  mode: 'dark' as PaletteMode,
  tonalOffset: 0.2,
  primary: {
    main: 'rgb(202, 233, 255)',
  },
  secondary: {
    main: 'rgb(39, 120, 242)',
  },
  text: {
    primary: Color.explorer_textSecondary1,
    secondary: Color.explorer_textSecondary2,
    disabled: 'rgba(151, 151, 184, 0.6)',
  },
  background: {
    paper: 'rgb(22, 23, 31)',
    default: 'rgb(22, 23, 31)',
  },
  cow: {
    background: '#07162d',
    gradient:
      'radial-gradient(50% 500px at 50% -6%, rgba(0, 41, 102, 0.7) 0%, rgb(7, 24, 50) 50%, rgb(6, 22, 45) 100%), radial-gradient(circle at -70% 50%, rgba(0, 43, 102, 0.7) 0px, transparent 50%)',
  },
  warning: {
    main: Color.alertDark,
  },
}

export const lightPalette: PaletteOptions = {
  mode: 'light' as PaletteMode,
  tonalOffset: 0.5,
  primary: {
    main: 'rgb(5, 43, 101)',
  },
  secondary: {
    main: 'rgb(39, 120, 242)',
  },
  text: {
    primary: 'rgb(12, 38, 75)',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  cow: {
    background: '#ffffff',
    gradient: 'linear-gradient(45deg, rgb(234, 233, 255) 14.64%, rgb(202, 233, 255) 85.36%) fixed',
  },
  warning: {
    main: Color.alertLight,
  },
}
