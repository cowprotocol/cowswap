import { PaletteMode } from '@mui/material'
import { PaletteOptions } from '@mui/material/styles'

export const darkPalette: PaletteOptions = {
  mode: 'dark' as PaletteMode,
  tonalOffset: 0.2,
  primary: {
    main: 'rgb(229, 202, 255)',
  },
  secondary: {
    main: 'rgb(178, 39, 242)',
  },
  text: {
    primary: '#CAE9FF',
    secondary: '#809ab1',
    disabled: 'rgba(238, 202, 255, 0.6)',
  },
  background: {
    paper: 'rgb(60, 12, 75)',
    default: 'rgb(57, 12, 75)',
  },
  cow: {
    background: 'rgb(34, 7, 45)',
    gradient:
      'radial-gradient(50% 500px at 50% -6%, rgba(65, 0, 102, 0.7) 0%, rgb(29, 7, 50) 50%, rgb(29, 6, 45) 100%), radial-gradient(circle at -70% 50%, rgba(53, 0, 102, 0.7) 0px, transparent 50%)',
  },
}

export const lightPalette: PaletteOptions = {
  mode: 'light' as PaletteMode,
  tonalOffset: 0.5,
  primary: {
    main: 'rgb(74, 5, 101)',
  },
  secondary: {
    main: 'rgb(201, 39, 242)',
  },
  text: {
    primary: 'rgb(64, 12, 75)',
  },
  background: {
    default: 'rgb(255, 202, 255)',
    paper: 'rgb(255, 255, 255)',
  },
  cow: {
    background: 'rgb(255, 255, 255)',
    gradient: 'linear-gradient(45deg, rgb(251, 233, 255) 14.64%, rgb(236, 202, 255) 85.36%) fixed',
  },
}
